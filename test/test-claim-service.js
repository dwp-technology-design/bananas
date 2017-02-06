
var should = require('should');
var rest = require('restler');

var ClaimServiceApi = require('../libs/apis/ClaimServiceApi');
var InprocClaimService = require('../libs/infrastructure/inproc/InprocClaimService');

describe ('Claim Service', () => {
    it ('Submit a new claim and completes all necessary processing steps', (done) =>{
        should(1).equal(1);
        //Create a server

        var claimService = new InprocClaimService();
        
        var claimServiceApi = new ClaimServiceApi(claimService);

        claimServiceApi.start(8000, function(){
            //Create a JSON Payload with 
            // - firstname, middlename, lastname, dob, gender, title, nino, bank account, passport number
            //
            var payload = {
                firstName : 'John',
                middleName : 'Joe',
                lastName : 'Doe',
                dob : '01/01/1964',
                gender : 'male',
                title : 'Dr',
                nino : 'AB123456A',
                bankAccount : {
                    sortCode : '233512',
                    accountNumber : '12345678',
                    name : 'barclays'
                },
                address : {
                    line1 : 'Somehouse',
                    line2 : 'Someplace',
                    townCity : 'Somewhere',
                    postcode : 'XX1 1XX'
                },
                passportNumber : '123456789'
            };
            // POST the payload to /claims
            rest.postJson('http://localhost:8000/claims', payload).on('complete',function(data,response) {
                should.exist(response);
                should(response.statusCode).equal(201); 
                // Find the link to see your claim status
                var claimURL = data.actions.info.url;

                // GET the status of the claim /claims/:id
                //
                rest.get(claimURL).on('complete', function(data,response) {
                    should(response.statusCode).equal(200); 
                    // Assert on the following statuses being present
                    should.exist(data.status);
                    // 1. Submitted
                    should.exist(data.status.submitted);
                    // 2. Registered
                    // 3. Verified
                    // 4. EligibilityEvaluated
                    // 5. AwardCalculated
                    // 6. Payment Calculated
                    // 7. PaymentMade
                    // 8. StatementGenerated
                    // 9. NotificationSent
                    done();
                });
            });
        });
    });
});