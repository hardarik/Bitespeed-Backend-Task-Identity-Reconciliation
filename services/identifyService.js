const { Contact } = require('../models');
const { Op } = require('sequelize');

async function getPrimaryContact(contact) {
  if (contact.linkPrecedence === 'primary') return contact;
  const primary = await Contact.findByPk(contact.linkedId);
  return primary || contact;
}

async function findAllInCluster(primaryId, transaction = null) {
  const options = transaction ? { transaction } : {};
  const primary = await Contact.findByPk(primaryId, options);
  if (!primary) return [];
  const secondaries = await Contact.findAll({
    where: { linkedId: primaryId },
    ...options
  });
  return [primary, ...secondaries];
}

function buildResponse(primaryContact, clusterContacts) {
  const secondaryContacts = clusterContacts.filter(c => c.id !== primaryContact.id);
  const emailsSet = new Set();
  const phonesSet = new Set();
  if (primaryContact.email) emailsSet.add(primaryContact.email);
  if (primaryContact.phoneNumber) phonesSet.add(primaryContact.phoneNumber);
  secondaryContacts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  secondaryContacts.forEach(c => {
    if (c.email) emailsSet.add(c.email);
    if (c.phoneNumber) phonesSet.add(c.phoneNumber);
  });
  const emails = [];
  const phoneNumbers = [];
  if (primaryContact.email) emails.push(primaryContact.email);
  secondaryContacts.forEach(c => { if (c.email && !emails.includes(c.email)) emails.push(c.email); });
  if (primaryContact.phoneNumber) phoneNumbers.push(primaryContact.phoneNumber);
  secondaryContacts.forEach(c => { if (c.phoneNumber && !phoneNumbers.includes(c.phoneNumber)) phoneNumbers.push(c.phoneNumber); });
  return {
    primaryContatctId: primaryContact.id,
    emails,
    phoneNumbers,
    secondaryContactIds: secondaryContacts.map(c => c.id).sort((a, b) => a - b)
  };
}

async function identify(email, phoneNumber) {
  const hasEmail = email != null && String(email).trim() !== '';
  const hasPhone = phoneNumber != null && String(phoneNumber).trim() !== '';
  if (!hasEmail && !hasPhone) {
    const err = new Error('At least one of email or phoneNumber is required');
    err.statusCode = 400;
    throw err;
  }
  const normEmail = hasEmail ? String(email).trim().toLowerCase() : null;
  const normPhone = hasPhone ? String(phoneNumber).trim() : null;

  const whereClause = {
    [Op.or]: []
  };
  if (normEmail) whereClause[Op.or].push({ email: normEmail });
  if (normPhone) whereClause[Op.or].push({ phoneNumber: normPhone });
  if (whereClause[Op.or].length === 0) {
    const err = new Error('At least one of email or phoneNumber is required');
    err.statusCode = 400;
    throw err;
  }

  const existingContacts = await Contact.findAll({
    where: whereClause,
    order: [['createdAt', 'ASC']]
  });

  if (existingContacts.length === 0) {
    const created = await Contact.create({
      email: normEmail,
      phoneNumber: normPhone,
      linkedId: null,
      linkPrecedence: 'primary'
    });
    return {
      primaryContatctId: created.id,
      emails: normEmail ? [normEmail] : [],
      phoneNumbers: normPhone ? [normPhone] : [],
      secondaryContactIds: []
    };
  }

  const primaryIds = new Set();
  for (const c of existingContacts) {
    const primary = await getPrimaryContact(c);
    primaryIds.add(primary.id);
  }
  const primaries = await Contact.findAll({
    where: { id: { [Op.in]: Array.from(primaryIds) } },
    order: [['createdAt', 'ASC']]
  });
  const oldestPrimary = primaries[0];
  const otherPrimaries = primaries.slice(1);

  return await Contact.sequelize.transaction(async (transaction) => {
    for (const p of otherPrimaries) {
      const secondariesOfP = await Contact.findAll({
        where: { linkedId: p.id },
        transaction
      });
      for (const s of secondariesOfP) {
        await s.update({ linkedId: oldestPrimary.id }, { transaction });
      }
      await p.update({
        linkedId: oldestPrimary.id,
        linkPrecedence: 'secondary'
      }, { transaction });
    }

    const primaryId = oldestPrimary.id;
    const allInCluster = await findAllInCluster(primaryId, transaction);
    const isDuplicate = allInCluster.some(c =>
      (c.email === normEmail || (normEmail == null && c.email == null)) &&
      (c.phoneNumber === normPhone || (normPhone == null && c.phoneNumber == null))
    );
    if (!isDuplicate) {
      const hasNewInfo = (normEmail && !allInCluster.some(c => c.email === normEmail)) ||
        (normPhone && !allInCluster.some(c => c.phoneNumber === normPhone));
      if (hasNewInfo) {
        await Contact.create({
          email: normEmail,
          phoneNumber: normPhone,
          linkedId: primaryId,
          linkPrecedence: 'secondary'
        }, { transaction });
      }
    }

    const clusterAfter = await findAllInCluster(primaryId, transaction);
    const primaryContact = clusterAfter.find(c => c.id === primaryId) || oldestPrimary;
    return buildResponse(primaryContact, clusterAfter);
  });
}

module.exports = { identify };
