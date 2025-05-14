const API_URL = process.env.API_URL

const testData = [
  {
    title: "Finish slides and code for presentation",
  },
  {
    title: "Implement some error handling for the frontend code",
  },
  {
    title: "Review PR for IaC project",
  },
  {
    title: "Find new freelance clients to pay the bills",
  },
  {
    title: "Thank everyone for being here and listening to my talk",
  },
]

for (const data of testData) {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}