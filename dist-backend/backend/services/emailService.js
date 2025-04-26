export const sendVerificationEmail = async (email, token) => {
    // For now, just log the verification link
    const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
    console.log(`Verification email would be sent to ${email}`);
    console.log(`Verification link: ${verificationLink}`);
    // In a real implementation, this would use a service like SendGrid, AWS SES, etc.
    // await emailService.send({
    //   to: email,
    //   subject: 'Verify your email',
    //   html: `Click <a href="${verificationLink}">here</a> to verify your email.`
    // });
};
