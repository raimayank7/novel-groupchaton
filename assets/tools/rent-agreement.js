/* Infinity by GroupChatOn — rent-agreement. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var P = [['landlord', 'Owner (landlord) name', 'Ramesh Kumar Sharma'], ['laddr', 'Owner’s address', '45, Model Town, Ludhiana, Punjab'], ['tenant', 'Tenant name', 'Asha Verma'], ['taddr', 'Tenant’s permanent address', '12, Civil Lines, Jalandhar, Punjab'],
    ['property', 'Rented property', 'First floor, 45, Model Town, Ludhiana, Punjab 141002 (2 bedrooms, kitchen, bathroom)'], ['rent', 'Monthly rent', 'Rs. 15,000 (Rupees Fifteen Thousand)'], ['deposit', 'Security deposit', 'Rs. 30,000 (Rupees Thirty Thousand)'],
    ['start', 'Start date', '1 December 2026'], ['months', 'Period (months)', '11'], ['dueday', 'Rent due by (day of month)', '7th'], ['hike', 'Rent increase on renewal', '5%'], ['notice', 'Notice period (months)', '1'],
    ['bills', 'Who pays electricity and water bills', 'the Tenant, as per the meter readings'], 'place'];
  var sign = function (f, a, b) { return '\n\nIN WITNESS WHEREOF, the parties have signed this agreement at ' + f.place + ' on the date first written above.\n\n\n' + a + '\n' + f.landlord + '\n\n\n' + b + '\n' + f.tenant + '\n\n\nWITNESSES:\n1. Name and address: ______________________   Signature: __________\n2. Name and address: ______________________   Signature: __________'; };
  GCOTools.engine('letter', 'rent-agreement', {
    templates: [
      { id: 'home', group: 'Rent agreements', name: 'Residential rent agreement (11 months)', fields: P,
        letter: function (f, x) { return 'RENT AGREEMENT\n\nThis Rent Agreement is made at ' + f.place + ' on ' + x.date + ' between:\n\n' + f.landlord + ', resident of ' + f.laddr + ' (hereinafter called the "Owner", which term includes heirs, successors and assigns) of the one part;\n\nAND\n\n' + f.tenant + ', permanent resident of ' + f.taddr + ' (hereinafter called the "Tenant") of the other part.\n\n' +
          'The Owner is the lawful owner of ' + f.property + ' (the "Premises") and has agreed to let it to the Tenant on the following terms:\n\n' +
          '1. PERIOD: The tenancy is for ' + f.months + ' months starting from ' + f.start + '. It may be renewed by mutual consent in writing.\n' +
          '2. RENT: The Tenant shall pay a monthly rent of ' + f.rent + ' on or before the ' + f.dueday + ' day of every month, by bank transfer, UPI or cheque, and the Owner shall give a receipt.\n' +
          '3. SECURITY DEPOSIT: The Tenant has paid ' + f.deposit + ' as an interest-free security deposit, which shall be refunded when the Premises are vacated, after deducting any unpaid rent, bills or cost of damage beyond normal wear and tear.\n' +
          '4. BILLS: Electricity and water charges shall be paid by ' + f.bills + '. Society maintenance, if any, as agreed between the parties.\n' +
          '5. USE: The Premises shall be used only for residence by the Tenant and family. The Tenant shall not sublet or part with possession of the Premises.\n' +
          '6. CARE AND REPAIRS: The Tenant shall keep the Premises clean and in good condition. Minor day-to-day repairs are the Tenant’s responsibility; structural and major repairs are the Owner’s.\n' +
          '7. CHANGES: The Tenant shall not make structural changes without the Owner’s written permission.\n' +
          '8. INSPECTION: The Owner may inspect the Premises at a reasonable time after giving prior notice.\n' +
          '9. NOTICE: Either party may end this agreement by giving ' + f.notice + ' month(s) notice in writing.\n' +
          '10. RENEWAL: On renewal the rent shall increase by ' + f.hike + ', unless both parties agree otherwise.\n' +
          '11. HANDOVER: At the end of the tenancy the Tenant shall hand over vacant possession of the Premises with all fittings listed below, in the same condition, except normal wear and tear.\n' +
          '12. POLICE VERIFICATION: The Tenant shall provide identity documents for police verification as required by local rules.\n\nFITTINGS AND FIXTURES: ____ fans, ____ tube lights, ____ geyser, ____ keys.' + sign(f, 'OWNER', 'TENANT'); } },
      { id: 'licence', group: 'Rent agreements', name: 'Leave and licence agreement', fields: P,
        letter: function (f, x) { return 'LEAVE AND LICENCE AGREEMENT\n\nThis Agreement is made at ' + f.place + ' on ' + x.date + ' between ' + f.landlord + ', residing at ' + f.laddr + ' (the "Licensor") and ' + f.tenant + ', residing at ' + f.taddr + ' (the "Licensee").\n\n' +
          '1. The Licensor permits the Licensee to use ' + f.property + ' (the "Licensed Premises") on leave and licence basis only, for ' + f.months + ' months from ' + f.start + '.\n' +
          '2. This agreement does not create any tenancy or lease, and the Licensee shall not claim any tenancy right or interest in the Licensed Premises.\n' +
          '3. The Licensee shall pay a licence fee of ' + f.rent + ' per month on or before the ' + f.dueday + ' day of each month.\n' +
          '4. The Licensee has paid an interest-free refundable deposit of ' + f.deposit + ', to be returned when the Licensed Premises are handed back, after adjusting any dues.\n' +
          '5. Electricity and water charges shall be paid by ' + f.bills + '.\n' +
          '6. The Licensee shall use the Licensed Premises for residence only, shall not sublet, and shall follow the rules of the building or society.\n' +
          '7. Either party may end this agreement by giving ' + f.notice + ' month(s) written notice.\n' +
          '8. On expiry or termination, the Licensee shall hand back the Licensed Premises in good condition. Any renewal shall be at a licence fee increased by ' + f.hike + ' unless agreed otherwise.\n' +
          '9. This agreement shall be registered if the law of the state requires it, with stamp duty and registration charges shared as agreed.' + sign(f, 'LICENSOR', 'LICENSEE'); } },
      { id: 'shop', group: 'Rent agreements', name: 'Shop / commercial rent agreement', fields: P.concat([['business', 'Business to be run', 'a mobile phone shop'], ['lockin', 'Lock-in period (months)', '6']]),
        letter: function (f, x) { return 'COMMERCIAL RENT AGREEMENT\n\nThis Agreement is made at ' + f.place + ' on ' + x.date + ' between ' + f.landlord + ' of ' + f.laddr + ' (the "Owner") and ' + f.tenant + ' of ' + f.taddr + ' (the "Tenant").\n\n' +
          '1. The Owner lets ' + f.property + ' (the "Shop") to the Tenant for ' + f.months + ' months from ' + f.start + ', for running ' + f.business + ' only.\n' +
          '2. The monthly rent is ' + f.rent + ', plus GST if applicable, payable by the ' + f.dueday + ' day of each month.\n' +
          '3. The Tenant has paid a refundable, interest-free security deposit of ' + f.deposit + '.\n' +
          '4. There is a lock-in period of ' + f.lockin + ' months during which neither party may end this agreement, except for breach of its terms.\n' +
          '5. After the lock-in, either party may end it with ' + f.notice + ' month(s) written notice.\n' +
          '6. The Tenant shall obtain any trade licences needed for the business and shall bear electricity, water and other charges (' + f.bills + ').\n' +
          '7. The Tenant shall not sublet, carry on any illegal or hazardous activity, or make structural changes without written consent.\n' +
          '8. Signboards may be put up as allowed by local rules and the building.\n' +
          '9. On renewal the rent shall increase by ' + f.hike + ' unless agreed otherwise.\n' +
          '10. The Tenant shall hand over vacant possession at the end of the term in good condition, except normal wear and tear.' + sign(f, 'OWNER', 'TENANT'); } },
      { id: 'room', group: 'Rent agreements', name: 'Room / PG agreement', fields: P.concat([['meals', 'Meals and services included', 'breakfast and dinner, Wi-Fi and weekly cleaning']]),
        letter: function (f, x) { return 'ROOM / PAYING GUEST AGREEMENT\n\nMade at ' + f.place + ' on ' + x.date + ' between ' + f.landlord + ' (the "Owner") and ' + f.tenant + ', permanent address ' + f.taddr + ' (the "Guest").\n\n' +
          '1. The Owner provides the Guest with ' + f.property + ' from ' + f.start + ' for ' + f.months + ' months.\n' +
          '2. Monthly charges: ' + f.rent + ', payable by the ' + f.dueday + ' of each month, including ' + f.meals + '.\n' +
          '3. Refundable deposit: ' + f.deposit + ', returned on leaving after adjusting dues and damage.\n' +
          '4. Electricity and water: ' + f.bills + '.\n' +
          '5. The Guest shall follow the house rules on visitors, timings, noise and cleanliness, and shall not keep anything illegal or dangerous.\n' +
          '6. Either party may end this arrangement with ' + f.notice + ' month(s) notice.\n' +
          '7. The Guest shall give identity documents for police verification.' + sign(f, 'OWNER', 'GUEST'); } },
      { id: 'intl', group: 'Other countries', name: 'Simple residential lease (general)', fields: P,
        letter: function (f, x) { return 'RESIDENTIAL LEASE AGREEMENT\n\nThis Lease is made on ' + x.date + ' between ' + f.landlord + ' of ' + f.laddr + ' ("Landlord") and ' + f.tenant + ' of ' + f.taddr + ' ("Tenant").\n\n' +
          '1. PROPERTY: The Landlord leases to the Tenant the property at ' + f.property + '.\n' +
          '2. TERM: ' + f.months + ' months, beginning ' + f.start + '.\n' +
          '3. RENT: ' + f.rent + ' per month, due on the ' + f.dueday + ' day of each month.\n' +
          '4. DEPOSIT: ' + f.deposit + ', held and returned as required by local law, less lawful deductions.\n' +
          '5. UTILITIES: Paid by ' + f.bills + '.\n' +
          '6. USE AND OCCUPANCY: The property is to be used as a private residence only. No subletting without written consent.\n' +
          '7. MAINTENANCE: The Tenant keeps the property clean and reports repairs promptly; the Landlord makes necessary repairs within a reasonable time.\n' +
          '8. ENTRY: The Landlord may enter with reasonable notice, except in an emergency.\n' +
          '9. TERMINATION: Either party may end the lease with ' + f.notice + ' month(s) written notice, or as allowed by local law.\n' +
          '10. GOVERNING LAW: This lease follows the laws of the place where the property is located.' + sign(f, 'LANDLORD', 'TENANT'); } }
    ],
    test: [{ t: 'home', in: { landlord: 'R. K. Sharma', tenant: 'Asha Verma', rent: 'Rs. 12,000', months: '11', place: 'Pune' }, has: ['monthly rent of Rs. 12,000', 'tenancy is for 11 months', 'agreement at Pune', 'OWNER\nR. K. Sharma'] }]
  });
  var mo = new MutationObserver(function () {
    var card = document.querySelector('[data-gco-tool="rent-agreement"] .gco-tool-mount .tool-app');
    if (!card || card.querySelector('.tlegal')) return;
    card.insertBefore(GCOTools.h('p', { 'class': 'tnote tlegal', style: 'padding:10px 12px;border-radius:12px;background:var(--accent-soft);border:1px solid var(--line)' }, [GCOTools.h('b', { text: '⚖️ Please note: ' }),
      'This is a general draft to edit, not legal advice. Rent laws, stamp duty, e-stamping and registration rules differ by country and state (in India, agreements over 11 months usually must be registered). Check your local rules or ask a lawyer before signing.']), card.firstChild);
    mo.disconnect();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
