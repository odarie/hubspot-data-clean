require('dotenv').config()

async function testAPI() {
  const response = await fetch(`${process.env.BASE_URL}/crm/v3/objects/contacts?limit=10`, {
    method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
        }
  })
  const data = await response.json()
  console.log(`Status: ${response.status}`)
  console.log(data)
}

testAPI()
