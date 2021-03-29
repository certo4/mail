let MAILBOX = '';
let EMAILID = '';


document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Function to send email
  const composeForm = document.querySelector('#compose-form');
  composeForm.addEventListener('submit', event => sendEmail(event));

  // Add click events to archive and reply buttons
  document.querySelector('#archive').addEventListener('click', () => archiveEmail());
  document.querySelector('#reply').addEventListener('click', () => replyToEmail());

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Setting the global mailbox variable
  MAILBOX = mailbox;
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      const emailsView = document.querySelector('#emails-view');

      if (emails.length === 0) {
        emailsView.innerHTML += "No emails found";
      } else {
        emails.forEach(addEmailToView);
      }
  });

}

function addEmailToView(email) {
  const row = document.createElement('div');

  row.classList.add('row-style');

  if (email.read) {
    row.classList.add('read');
  }
  
  row.innerHTML = `<strong>${email.sender}</strong> ${email.subject} <span class="timestamp">${email.timestamp}</span>`;
  
  // On email click
  row.addEventListener('click', () => {
    viewEmail(email.id);
  });
  
  document.querySelector('#emails-view').append(row);
}

function viewEmail(id) {
  // Setting the global mailbox variable
  EMAILID = id;

  // Show single email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Flushing the default values in the email
  document.querySelector('#from').innerHTML = '';
  document.querySelector('#to').innerHTML = '';
  document.querySelector('#subject').innerHTML = '';
  document.querySelector('#timestamp').innerHTML = '';
  document.querySelector('#body').innerHTML = '';

  // Marking email as read
  if (MAILBOX === 'inbox') {
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  }

  // Fetch email details from db and display them
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      emailDetails(email);
  });
  
}

function emailDetails(email) {

  // If not on Sent, show archive button
  if (MAILBOX !== 'sent') {
    document.querySelector('#archive').style.display = 'block';
    document.querySelector('#archive').innerHTML = '';

    if (MAILBOX === 'inbox') {
      document.querySelector('#archive').innerHTML = 'Archive';
    } else {
      document.querySelector('#archive').innerHTML = 'Unarchive';
    }
  }

  //Show Reply button
  document.querySelector('#reply').style.display = 'block';

  // Populate the email details with the information from server
  document.querySelector('#from').innerHTML = email.sender;
  document.querySelector('#to').innerHTML = email.recipients;
  document.querySelector('#subject').innerHTML = email.subject;
  document.querySelector('#timestamp').innerHTML = email.timestamp;
  document.querySelector('#body').innerHTML = email.body;
}

function sendEmail(event) {
  event.preventDefault();

  // Getting all user input to send to API
  const formRecipients = document.querySelector('#compose-recipients').value;
  const formSubject = document.querySelector('#compose-subject').value;
  const formBody = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: formRecipients,
        subject: formSubject,
        body: formBody,
        archived: false,
        read: false
    })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);

        // Redirecting to sent inbox
        load_mailbox('sent');  
    });
}

function archiveEmail() {
  let archive = false;
  if (MAILBOX === 'inbox') {
    archive = true;
  }

  fetch(`/emails/${EMAILID}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: archive
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);

      // TODO: Unexpected end of JSON

      // Redirecting to sent inbox
      load_mailbox('inbox');  
  })
  .catch((error) => {
    console.log(error);

    // Redirecting to sent inbox
    load_mailbox('inbox');
  });
}

function replyToEmail() {
  // Show compose view and hide other views
  compose_email();

  fetch(`/emails/${EMAILID}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // Pre-filling form fields with reply information
    document.querySelector('#compose-recipients').value = email.sender;

    // Add 'Re: ' only if it is not present already
    let newSubject = email.subject;
    if (newSubject.slice(0,4) !== 'Re: ') {
      newSubject = `Re: ${email.subject}`;
    }
    
    document.querySelector('#compose-subject').value = newSubject;
    document.querySelector('#compose-body').value = `\n\n\n<hr>On ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
  });
}

