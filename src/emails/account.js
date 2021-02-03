const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'hello@lindsaypowerharding.com',
        subject: 'Thanks for joining!',
        text: `Welcome to the app ${name}, feel free to reach out if you have any questions!`
    })
    .then(() => {
        console.log('Email sent')
    })
    .catch((error) => {
        console.log(error)
    });
};

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'hello@lindsaypowerharding.com',
        subject: 'We\'re sorry to see you go!',
        text: `Anything we can do to change your mind ${name}?`
    })
    .then(() => {
        console.log('Cancellationlation email sent')
    })
    .catch((error) => {
        console.log(error)
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}