import json
from json import JSONEncoder
import time
import hashlib
import http.client

endpoint = "${endpoint}"
path = "${path}"

if __name__ == "__main__":
    
    #Make an http connection object pointed at the endpoint
    conn = http.client.HTTPConnection(endpoint)
    
    #This the generated JSON-RPC query code
    params = JSONEncoder().encode(${jsonrpcrequest})
    
    #Headers
    headers = {"Content-type": "application/json", "Accept": "text/plain", "Content-length": repr(len(params))}
    
    #Send it
    conn.request("POST", path, params, headers)
    
    resp = conn.getresponse()    
    
    #Response data is a binary string and I want to read it easily
    responseObject = resp.read().decode()
    
    #Doing a little pretty formating to get it to look nice on my output terminal
    print(json.dumps(json.loads(responseObject), sort_keys=True, indent=4))
    
    #Just being safe here
    conn.close()
    
