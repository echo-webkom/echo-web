<!DOCTYPE html>
<html lang="nb">
    <head>
        <title>${slug}</title>
        <style>
            html {
                font-family: Arial, sans-serif;
                text-align: center;
            }
            a {
                text-decoration: none;
                color: black;
            }
            td {
                padding-top: 1rem;
                padding-bottom: 1rem;
            }
            .italic {
                font-style: italic;
            }
            #csv-link {
                font-weight: bold;
                font-size: 1.5rem;
                padding: 3rem;
                color: blue;
            }
            #regs {
                display: grid;
                grid-template-columns: 10% 80% 10%;
                justify-content: center;
            }
            #regs-table {
                grid-column: 2;
            }
        </style>
    </head>
    <body>
        <h1>Påmeldinger for '${slug}'</h1>
        <a id="csv-link" href="/${registrationRoute}/${regsLink}?download">Last ned som CSV</a>
        <div id="regs">
            <table id="regs-table">
                <tr>
                    <th>Email</th>
                    <th>Fornavn</th>
                    <th>Etternavn</th>
                    <th>Årstrinn</th>
                    <#if answers?has_content>
                        <#assign showanswers = "yes">
                        <#list answers as answer>
                            <th>${answer.question}</th>
                        </#list>
                    </#if>
                    <th>På venteliste?</th>
                </tr>
                <#list regs as reg>
                    <tr>
                        <td>${reg.email}</td>
                        <td>${reg.firstName}</td>
                        <td>${reg.lastName}</td>
                        <td>${reg.degreeYear}</td>
                        <#if reg.answers?has_content>
                            <#list reg.answers as reganswer>
                                <td>${reganswer.answer}</td>
                            </#list>
                        <#elseif showanswers??>
                            <td class="italic">&lt;ikke besvart&gt;</td>
                        </#if>
                        <td>${reg.waitList?string('Ja', 'Nei')}</td>
                    </tr>
                </#list>
            </table>
        </div>
    </body>
</html>
