package no.uib.echo

import com.sendgrid.*
import com.sendgrid.Email
import java.io.IOException

fun sendEmail(from: String, to: String, subject: String, body: String, sendGrid: SendGrid): Boolean {
    val confirmationMail = Mail(
        Email(from),
        subject,
        Email(to),
        Content("text/plain", "$body\n\n(SVAR PÅ DENNE MAILEN VIL IKKE BLI BESVART. TA HELLER KONTAKT MED ANSVARLIGE FOR ARRANGEMENTET.)")
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
