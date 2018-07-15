
function PasteDB(monkDb) {

    this.monkDb = monkDb;

    this.countAddresses = function() {
       return monkDb.collection("addresses")
       .count({}, function(error, numOfDocs){
            if(error){
                console.log(error);
              return null;
            }else {
              return numOfDocs;
             }     
          }).catch((err)=>{
            console.log(err);
            return null;
          });
    }

    this.countPastebinsTotal = function() {
        return monkDb.collection('addresses').count();
    }

    this.countPastebinsToday = function() {
        var dt = new  Date();
        dt.setHours(0,0,0,0);        
        return monkDb.collection('addresses').count( { timestamp: { $gte: dt.toISOString() } } );
    }

    this.getAddressOfShortId = function(shortId) {

        return monkDb.collection('addresses')
            .findOne({shortid: shortId}, 'address')
            .then((doc) => {	
                try {				
                    let address = doc.address;	
                    if(address != null) {
                        console.log('address of shortId found', address);
                        return address;
                    }else {
                        console.log('find address failed...');
                        return null;
                    }
                } catch(err) {
                    console.log('find address failed... exception:' + err);
                    return null;
                }
            })
            .catch(err => {
                console.log('find address failed... exception:' + err);
                return null;
            });
    }

    this.getShortIdOfAddress = function(address) {

        return monkDb.collection('addresses')
            .findOne({address: address}, 'shortid')
            .then((doc) => {
                try {                
                    let shortId = doc.shortid;	
                    if(shortId != null) {
                        console.log('shortId of address found', shortId);
                        return shortId;
                    } else {
                        console.log('find shortId failed...');
                    }
                } catch(err) {
                    console.log('find shortId failed... exception:' + err);
                    return null;	  
                }
            }).catch(err => {
                console.log('find shortId failed... exception:'+err);
                return null;
            });
    }

    this.insert = function(document) {
        return monkDb.collection('addresses').insert(document)
            .then((result) => 
            {
                console.log("RESULT THEN",result);
                if (result != null) {                
                    return true;
                } else {
                    return false;
                } 
            })
    }
}

module.exports = {
    PasteDB: PasteDB
}