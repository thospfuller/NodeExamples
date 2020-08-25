/**
 * Precondition:
 *
 * - npm install aws-sdk
 */

const AWS = require('aws-sdk');

AWS.config["credentials"] = new AWS.SharedIniFileCredentials({profile: 'thospfuller-aws-cli'});

AWS.config["logger"] = console;

/**
 * See also: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ec2-example-creating-an-instance.html
 *
 * aws ec2 run-instances
 * --image-id ami-02354e95b39ca8dec
 * --count 1
 * --instance-type t2.micro
 * --region us-east-1
 * --profile thospfuller-aws-cli
 * --subnet subnet-0969b587cc72969d2
 * --tag-specifications 'ResourceType=instance,Tags=[{Key=costCenter,Value=45678}, {Key=department,Value=Energy}]'
 */

AWS.config.update({region: 'us-east-1'});

// Amazon Linux 2 AMI (HVM), SSD Volume Type - ami-02354e95b39ca8dec (64-bit x86) / ami-0c5bf07e510b75b11 (64-bit Arm)
const instanceParams = {
    ImageId: 'ami-02354e95b39ca8dec',
    InstanceType: 't2.micro',
    SubnetId: 'subnet-0969b587cc72969d2',
    MinCount: 1,
    MaxCount: 1
};

const instancePromise = new AWS.EC2({apiVersion: '2016-11-15'}).runInstances(instanceParams).promise();

instancePromise.then(

    function(data) {

        console.log("Data: ", data);

        const instanceId = data.Instances[0].InstanceId;

        console.log("Created instance with id: ", instanceId);

        let tagParams = {
            Resources: [instanceId], Tags: [
                {
                    Key: 'costCenter',
                    Value: '45678'
                }, {
                    Key: 'department',
                    Value: 'Energy'
                },
            ]
        };

        const tagPromise = new AWS.EC2({apiVersion: '2016-11-15'}).createTags(tagParams).promise();

        tagPromise.then(
            function(data) {
                console.log("Instance created successfully.");
            }).catch(
            function(err) {
                console.error("Unable to create an EC2 instance.", err, err.stack);
            });
    }).catch(
        function(err) {
            console.error("The request to create an EC2 instance was rejected.", err, err.stack);
        });

console.log("...done!");