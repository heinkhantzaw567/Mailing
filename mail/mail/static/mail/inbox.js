document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#submit').addEventListener('click', sending_email);


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  create_mail(mailbox);
}

function sending_email()
{
  const to =document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  if (!to || !subject || !body) {
    console.error("All fields (recipients, subject, body) are required.");
    return;
  }
  
  fetch ('/emails',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    
    body: JSON.stringify({
    recipients: to,
    subject: subject,
    body: body
    })
    
  
  }).then(response => response.json())
  .then(data => {
    if (data.error)
    {
      alert(`${data.error}`)
    }
    else{
      console.log(`${data.message}`)
      alert(`${data.message}`)
    }
  })
  
  
}

function create_mail(name)
{
  const container = document.createElement('div');
  document.querySelector('#emails-view').append(container);
  fetch (`emails/${name}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails)
    emails.forEach (email => {
    const element= document.createElement('div');
    // element.classList.add('container-lg');
    element.classList.add('mailbox');
    element.innerHTML = `<strong> ${email.recipients}</strong> <em>${email.subject}</em>  <small>${email.timestamp}<small>`;
    element.addEventListener('click', function() {
      console.log('This element has been clicked!')
    });
     container.append(element);
    }) 

    
  })
  
  
}