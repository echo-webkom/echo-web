package no.uib.echo

import com.sendgrid.Method
import com.sendgrid.Request
import com.sendgrid.SendGrid
import com.sendgrid.helpers.mail.Mail
import com.sendgrid.helpers.mail.objects.Content
import com.sendgrid.helpers.mail.objects.Email
import java.io.IOException

fun sendEmail(from: String, to: String, subject: String, body: String, sendGrid: SendGrid): Boolean {
    val confirmationMail = Mail(
        Email(from),
        subject,
        Email(to),
        Content("text/plain", body)
    )
    val req = Request()
    try {
        req.method = Method.POST
        req.endpoint = "mail/send"
        req.body = confirmationMail.build()
        val response = sendGrid.api(req)

        if (response.statusCode != 202) {
            throw Exception("Status code is not 202: ${response.statusCode}, ${response.body}")
        }
    } catch (e: IOException) {
        e.printStackTrace()
        return false
    }

    return true
}
