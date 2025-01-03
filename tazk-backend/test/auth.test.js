import { use, expect } from "chai";
import chaiHttp from "chai-http";
import app from "../express.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/user.model.js";

const chai = use(chaiHttp);

let mongoServer;

before(async () => {
  // Create a new In-Memory MongoDB instance and connect Mongoose
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect Mongoose to the In-Memory MongoDB Instance
  await mongoose.connect(uri);
});

after(async () => {
  // Close Mongoose Connection and Stop Server
  await mongoose.connection.dropDatabase();
  /** 
    will close particular this connection to the database
    await mongoose.connection.close();
    */
  await mongoose.disconnect(); // will close all connections
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear All COllections Before Each Test
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

describe("Auth Routes Test", () => {
  describe("POST /v1/api/auth/signup", () => {
    it("Should create a new user", (done) => {
      chai.request
        .execute(app)
        .post("/v1/api/auth/signup")
        .send({
          username: "test user",
          email: "test@mail.com",
          password: "password@test123",
        })
        .end(async (err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("success").to.be.true;
          expect(res.body)
            .to.have.property("message")
            .to.be.equal("User created successfully");
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.have.property("username");
          expect(res.body.data).to.have.property("email");
          expect(res.body.data).to.have.property("_id");

          const user = await User.findOne({ username: "test user" });
          expect(user).to.not.be.null;
          expect(user.email).to.be.equal("test@mail.com");
          done();
        });
    });

    it("Should return an error if username is missing", (done) => {
      chai.request
        .execute(app)
        .post("/v1/api/auth/signup")
        .send({
          email: "test@mail.com",
          password: "password@test123",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("success").to.be.false;
          expect(res.body)
            .to.have.property("message")
            .to.be.equal("Username is required");
          done();
        });
    });

    it("Should return an error if email is missing", (done) => {
      chai.request
        .execute(app)
        .post("/v1/api/auth/signup")
        .send({
          username: "test user",
          password: "password@test123",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("success").to.be.false;
          expect(res.body)
            .to.have.property("message")
            .to.be.equal("Email is required");
          done();
        });
    });

    it("Should return an error if password is missing", (done) => {
      chai.request
        .execute(app)
        .post("/v1/api/auth/signup")
        .send({
          email: "test@mail.com",
          username: "test user",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("success").to.be.false;
          expect(res.body)
            .to.have.property("message")
            .to.be.equal("Password is required");
          done();
        });
    });

    it("Should return an error if user already exists", async () => {
      const user = new User({
        username: "test user",
        email: "test@mail.com",
        password: "password@test123",
      });

      await user.save();
      return chai.request
        .execute(app)
        .post("/v1/api/auth/signup")
        .send({
          username: "test user",
          email: "test@mail.com",
          password: "password@test123",
        })
        .end((err, res) => {
          expect(res).to.have.status(409);
          expect(res.body).to.have.property("success").to.be.false;
          expect(res.body)
            .to.have.property("message")
            .to.be.equal("Email already exists");
        });
    });
  });

  describe("POST /v1/api/auth/signin", () => {
    it("Should sign in a user", async () => {
      const user = new User({
        username: "test user",
        email: "test@mail.com",
        password: "password@test123",
      });
      await user.save();
      return chai.request
        .execute(app)
        .post("/v1/api/auth/signin")
        .send({
          email: "test@mail.com",
          password: "password@test123",
        })
        .end(async (err, res) => {
          expect(res).to.have.status(200);
          expect(res)
            .to.have.cookie("refreshToken")
            .to.include({ httpOnly: true });
          expect(res.body).to.have.property("success").to.be.true;
          expect(res.body)
            .to.have.property("message")
            .to.be.equal("Sign in successful");
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.have.property("username");
          expect(res.body.data).to.have.property("email");
          expect(res.body.data).to.have.property("_id");
          expect(res.body.data).to.have.property("accessToken");

          const user = await User.findOne({ email: "test@mail.com" });
          expect(user).to.not.be.null;
          expect(user.refreshToken).to.not.be.null;
        });
    });

    it("Should return an error if email is missing", (done) => {
      chai.request
        .execute(app)
        .post("/v1/api/auth/signin")
        .send({
          password: "password@test123",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("success").to.be.false;
          expect(res.body)
            .to.have.property("message")
            .to.be.equal("Email is required");
          done();
        });
    });

    it("Should return an error if password is missing", (done) => {
      chai.request
        .execute(app)
        .post("/v1/api/auth/signin")
        .send({
          email: "test@mail.com",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("success").to.be.false;
          expect(res.body)
            .to.have.property("message")
            .to.be.equal("Password is required");
          done();
        });
    });
  });

  // describe("GET /v1/api/auth/signout", () => {
  //   it("Should sign out a user", async () => {
  //     const user = new User({
  //       username: "test user",
  //       email: "test@mail.com",
  //       password: "password@test123",
  //     });
  //     await user.save();
  //     const accessToken = await chai.request
  //       .execute(app)
  //       .post("/v1/api/auth/signin")
  //       .send({
  //         email: "test@mail.com",
  //         password: "password@test123",
  //       })
  //       .then((res) => {
  //         return res.body.data.accessToken;
  //       });

  //     return chai.request
  //       .execute(app)
  //       .get("/v1/api/auth/signout")
  //       .set("Authorization", `Bearer ${accessToken}`)
  //       .end(async (err, res) => {
  //         expect(res).to.have.status(200);
  //         expect(res.body).to.have.property("success").to.be.true;
  //         expect(res.body)
  //           .to.have.property("message")
  //           .to.be.equal("Sign out successful");

  //         const user = await User.findOne({ email: "test@mail.com" });
  //         expect(user).to.not.be.null;
  //         expect(user.refreshToken).to.be.null;
  //       });
  //   });
  // });
});
