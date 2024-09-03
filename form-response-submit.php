<?php 

 # Run the curl command and pipe the response to xmllint
$sessionId=$(curl --location 'https://login.salesforce.com/services/Soap/u/61.0' \
--header 'Content-Type: text/xml' \
--header 'SOAPAction: deploy' \
--header 'Cookie: BrowserId=jCicxksWEe-m51_7GYmA1A; CookieConsentPolicy=0:0; LSKey-c$CookieConsentPolicy=0:0' \
--data-raw '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:partner.soap.sforce.com">
    <soapenv:Body>
        <urn:login>
            <urn:username>shahbaj.khan@stetig.in.stetigrel</urn:username>
            <urn:password>Integration#1718mvw6YFTo6Y6qf1qKNJYOa6pRd</urn:password>
        </urn:login>
    </soapenv:Body>
</soapenv:Envelope>' | xmllint --xpath "string(//sessionId)" -)

echo "Session ID: $sessionId"
exit;