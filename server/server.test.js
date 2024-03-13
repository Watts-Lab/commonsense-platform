const request = require("supertest");
const app = require("./server");

describe("API Routes", () => {
  const routers = [
    { path: "/api/statements", router: require("./routes/statements"), method: "post"},
    { path: "/api/answers", router: require("./routes/answers") },
    { path: "/api/results", router: require("./routes/results") },
    { path: "/api/users", router: require("./routes/users") },
    { path: "/api/treatments", router: require("./routes/treatments") },
    { path: "/api/feedbacks", router: require("./routes/feedbacks") },
    { path: "/api/userstatements", router: require("./routes/userstatements") },
    { path: "/api/experiments", router: require("./routes/experiment") },
  ];

  routers.forEach((route) => {
    describe(`GET ${route.path}`, () => {
      it("should return 200 OK", async () => {
        const response = await request(app).get(route.path);
        expect(response.status).toBe(200);
      });
    });
  });

  
});
