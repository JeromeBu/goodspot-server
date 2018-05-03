const server = require("../../../../index")
const User = require("../model")
const { emptyDb } = require("../../../server")
const factory = require("../../../utils/modelFactory")

const chai = require("chai")
const should = require("chai").should()
const chaiHttp = require("chai-http")

chai.use(chaiHttp)

describe("User routes", () => {
  describe("GET /api/users/:id", () => {
    beforeEach(done => {
      User.remove({}, () => {
        done()
      })
    })
    it("Check autentification before giving access", async () => {
      const user = await factory.user({})
      let res = null
      try {
        res = await chai
          .request(server)
          .get(`/api/users/${user.id}`)
          .set("Authorization", `Bearer ${user.token}`)
          .set("Content-Type", "application/json")
      } catch (error) {
        res = error.response
      }

      res.should.have.status(200)
      res.should.be.a("object")
      res.body.should.have.property("account")
      res.body.account.should.have.property("firstName")
    })
    it("Raise an error if user Bearer doesn't match a user", async () => {
      const user = await factory.user({})
      let res = null
      try {
        res = await chai
          .request(server)
          .get(`/api/users/${user.id}`)
          .set("Authorization", "Bearer wrong_token")
          .set("Content-Type", "application/json")
      } catch (error) {
        res = error.response
      }
      res.should.have.status(401)
      res.should.be.a("object")
      res.body.should.have.property("error").that.include("Unauthorized")
    })
    it("Raise an error if no user find with this id", async () => {
      const user = await factory.user({})
      let res = null
      try {
        res = await chai
          .request(server)
          .get("/api/users/5aa15025d0b973cdf7bb5bac")
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${user.token}`)
      } catch (error) {
        res = error.response
      }

      res.should.have.status(404)
      res.should.be.a("object")
      res.body.should.have.property("error").that.include("User not found")
    })
    it("Raise an error if param user id is not the right format", async () => {
      const user = await factory.user({})
      let res = null
      try {
        res = await chai
          .request(server)
          .get("/api/users/5aa15025973cdf7bb5bac")
          .set("Content-Type", "application/json")
          .set("Authorization", `Bearer ${user.token}`)
      } catch (error) {
        res = error.response
      }
      res.should.have.status(503)
      res.should.be.a("object")
      res.body.should.have.property("error")
    })
  })

  describe("PUT /api/users/:id", function() {
    before(async () => {
      await emptyDb()

      this.user = await factory.user({ email: "lulu@mail.com" })
      this.adminUser = await factory.user({
        email: "admin@mail.com",
        role: "admin"
      })
    })
    it("Returns unauthorized if wrong token", async () => {
      let res = null
      try {
        res = await chai
          .request(server)
          .put(`/api/users/${this.user.id}`)
          .set("Authorization", "Bearer wrongToken")
          .set("Content-Type", "application/json")
      } catch (error) {
        res = error.response
      }

      res.should.have.status(401)
      res.should.be.a("object")
      res.body.should.have.property("error").that.includes("Unauthorized")
    })
    it("Returns unauthorized if user to modify is different from currentUser", async () => {
      let res = null
      try {
        res = await chai
          .request(server)
          .put(`/api/users/${this.adminUser.id}`)
          .set("Authorization", `Bearer ${this.user.token}`)
          .set("Content-Type", "application/json")
      } catch (error) {
        res = error.response
      }
      res.should.have.status(401)
      res.should.be.a("object")
      res.body.should.have.property("error").that.includes("Unauthorized")
      res.body.should.have
        .property("message")
        .that.includes("You are not allowed to update this user")
    })
    it("Returns error 400 if no data is given to update", async () => {
      let res = null
      try {
        res = await chai
          .request(server)
          .put(`/api/users/${this.adminUser.id}`)
          .set("Authorization", `Bearer ${this.adminUser.token}`)
          .set("Content-Type", "application/json")
      } catch (error) {
        res = error.response
      }
      res.should.have.status(400)
      res.should.be.a("object")
      res.body.should.have
        .property("error")
        .that.include("no data to update given")
    })
    it("Returns error 503 if userId is wrong format", async () => {
      let res = null
      try {
        res = await chai
          .request(server)
          .put(`/api/users/${this.adminUser.id}error`)
          .set("Authorization", `Bearer ${this.adminUser.token}`)
          .set("Content-Type", "application/json")
          .send({
            dataToUpdateInAccount: {
              lastName: "myNewLastName"
            }
          })
      } catch (error) {
        res = error.response
      }
      res.should.have.status(503)
      res.should.be.a("object")
      res.body.should.have.property("error")
    })
    it("Returns error 404 if user do not exist", async () => {
      let res = null
      try {
        res = await chai
          .request(server)
          .put("/api/users/5ab0ec1621e92041c84aa80f")
          .set("Authorization", `Bearer ${this.adminUser.token}`)
          .set("Content-Type", "application/json")
          .send({
            dataToUpdateInAccount: {
              lastName: "myNewLastName"
            }
          })
      } catch (error) {
        res = error.response
      }
      res.should.have.status(404)
      res.should.be.a("object")
      res.body.should.have
        .property("error")
        .that.include("no User found with that id")
    })
    it("Updates user", async () => {
      const newLastName = "SuperNewName"
      let res = null
      try {
        res = await chai
          .request(server)
          .put(`/api/users/${this.user.id}`)
          .set("Authorization", `Bearer ${this.user.token}`)
          .set("Content-Type", "application/json")
          .send({
            dataToUpdateInAccount: {
              lastName: newLastName
            }
          })
      } catch (error) {
        res = error.response
      }
      res.should.have.status(201)
      res.should.be.a("object")
      res.body.should.have
        .property("message")
        .that.include("user updated with success")
      res.body.should.have
        .property("user")
        .which.has.property("account")
        .which.has.property("firstName")
        .eql(this.user.account.firstName)
      res.body.user.account.lastName.should.eql(newLastName)
    })
  })
})
