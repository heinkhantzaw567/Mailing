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
  create_mail(mailbox)
  
}

async function sending_email()
{
  const to =document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  alert('hello1');
  try {
    const response = await fetch('/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients: to, subject: subject, body: body }),
    });

    const data = await response.json();
    console.log(data)
    if (response.ok) {
      console.log(data.message);
      alert(data.message); // Replace with a UI message
    } else {
      console.error(data.error);
      alert(data.error); // Replace with a UI error message
    }
  } catch (error) {
    console.error('Network or other error:', error);
    alert('An unexpected error occurred. Please try again.');
  }
}

function create_mail(name)
{
  
  const container = document.createElement('div');
  container.id = 'mails'
  var to ='';
  var from = '';
  document.querySelector('#emails-view').append(container);
  fetch (`/emails/${name}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails)
    emails.forEach (email => {
    const element= document.createElement('div');
    element.id = 'mail'
    if (name === "sent")
      {
        to = email.recipients
        from = email.sender
      }
    
    if (name === 'inbox' || name === 'archive')
    {
      from = email.recipients
      to = email.sender
    }
    console.log(to);
    console.log(from);
    // element.classList.add('container-lg');
    element.classList.add('mailbox');
    
    element.setAttribute('data-id',`${email.id}`);
    element.innerHTML = `<strong> ${to}</strong> <em>${email.subject}</em>  <small>${email.timestamp}<small>`;
    if (email.read === true)
    {
      element.style.background= 'lightgrey';
    }
    element.addEventListener('click', () => {
      document.querySelector('#emails-view').innerHTML ='';
      mail_detail(email.id, name);
    });
    
     container.append(element);
    }) 

    
  })
  
  
}
// detail of the email
async function mail_detail(id, name)
{
  const container = document.createElement('div');
container.id = 'mails';

const response = await fetch(`/emails/${id}`);
const data = await response.json();
var archi =''
var hein=''
if (data.archived === true)
{
  archi ="Archived"
  hein ='btn btn-sm btn-outline-primary'
} 
else{
  archi ="Archive"
  hein ='btn btn-sm btn-outline-danger'
}
var button ='';

if (name == 'sent')
{
  button= '';
}
else{
  button =`<button class="${hein}" id ="archive"> ${archi} </button>
  <button class="btn btn-sm btn-outline-primary" id ="reply"> Reply </button>`
}

container.innerHTML = `
  <span class="border-bottom">
  <div class="box">
  
  <p><strong>To:</strong> ${data.recipients}</p>
  <p><strong>From:</strong> ${data.sender}</p>
  <p><strong>Subject:</strong> ${data.subject}</p>
  <p><strong>Timestamp:</strong> ${data.timestamp}</p>
  ${button}
  </div>
  <hr>
  </span>
  <div>
  <p>${data.body}</p>
  </div>
  `;
  

  

  
  
  
  if (data.read === false)
  {
    fetch(`/emails/${id}`,{
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
  }
  document.querySelector('#emails-view').append(container);
  
  const replying = document.querySelector('#reply')
  console.log(replying.innerHTML)
  replying.addEventListener('click', ()=>
  {
    console.log(data);
    reply_fun(data)

  })
  const archive = document.querySelector('#archive')
  archive.addEventListener('click', ()=>
  {
    if (archive.classList.contains('btn-outline-danger')) {
      archive.classList.remove('btn-outline-danger');
      archive.innerHTML = 'Archived';
      archive.classList.add('btn-outline-primary');
      archived(id, true);
    } else if (archive.classList.contains('btn-outline-primary')) {
      archive.classList.remove('btn-outline-primary');
      archive.innerHTML = 'Archive';
      archive.classList.add('btn-outline-danger');
      archived(id, false);
    }
    
    
  })
}

function reply_fun(data)
{
  console.log("hein")
  
  compose_email();
  document.querySelector('#compose-recipients').setAttribute('disabled', 'true');
  document.querySelector('#compose-subject').setAttribute('disabled', 'true');
  if (data.subject.startsWith("Re:"))
  {
    document.querySelector('#compose-subject').value = `${data.subject}`;
  }
  else{
    document.querySelector('#compose-subject').value = `Re: ${data.subject}`;
  }
  document.querySelector('#compose-recipients').value = `${data.sender}`;
  
  document.querySelector('#compose-body').value = `"On ${data.timestamp} ${data.sender} wrote: ${data.body}"`;


}

async function  archived (id, bool) {
  
  fetch (`/emails/${id}`,{
    method: 'PUT',
    body: JSON.stringify({
      archived: bool
    })
  })
  const response = await fetch(`/emails/${id}`);
  const data = await response.json();
  console.log(data)
}