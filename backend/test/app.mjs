import chai from "chai";
import chaiHttp from "chai-http";
import { DEFAULTLIMIT, connectToDb, getMappings, getUsers, server } from "../src/app.mjs";
import { User, UserSheetMapping } from "../src/schemas.mjs";
import { DISArmor, DISInventoryItem, DISMutation, DISOrigin, DISStartingEquipment, DISWeapon, DeathInSpaceSheet } from "../src/deathInSpace/schema.mjs";
import { getDISSheets } from "../src/deathInSpace/routes.mjs";
import mongoose from "mongoose";
import chaiSubset from 'chai-subset'
import { Group } from "../src/groups/schema.mjs";

const expect = chai.expect;
chai.use(chaiHttp);
chai.use(chaiSubset)

//making it so self-signed certificates don't get rejected
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const agent = chai.request.agent(server);

await connectToDb(process.env.TEST_URL)

const testUsername = 'test@grImOirE-tt.space'
const testLowercase = testUsername.toLowerCase()
let userId

async function resetDb(){
    const promises = []
    promises.push(User.deleteMany({}))
    promises.push(DeathInSpaceSheet.deleteMany({}))
    promises.push(UserSheetMapping.deleteMany({}))
    promises.push(Group.deleteMany({}))
    await Promise.all(promises)
}

describe("sainity tests", () => {
    it("should connect to backend", (done) => {
        agent.get("/")
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            done()
        })
    })
})

describe("User creation", () => {
    let verificationCode

    it("should initate user creation", (done) => {
        agent.post("/api/signup")
        .send({email: testUsername, password: "password"})
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)

            //get code from json
            const json = JSON.parse(res.text)
            verificationCode = json.code
            done()
        })
    })

    it("should verify and complete user", (done) => {
        agent.post('/api/validate/email')
        .send({validation: verificationCode})
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(201)
            const user = JSON.parse(res.text)
            expect(user.email).to.equal(testLowercase)
            userId = user._id
            getUsers()
            .then((docs) => {
                expect(docs.length).to.equal(1)
                expect(docs[0].email).to.equal(testLowercase)
                done()
            })
        })
    })

    it("should deny duplicate email", (done) => {
        agent.post("/api/signup")
        .send({email: testUsername, password: "password"})
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(409)

            //get code from json
            const json = JSON.parse(res.text)
            expect(json).to.deep.equal({body:  "email " + testLowercase + " already exists"})
            done()
        })
    })

    it("should logout user", (done) => {
        agent.post('/api/signout')
        .end((err,res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            done()
        })
    })

    it("should not sign user in", (done) => {
        agent.post('/api/signin')
        .send({email: testUsername, password: "wrong password"})
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(401)
            const json = JSON.parse(res.text)
            expect(json).to.deep.equal({body: "access denied"})
            done()
        })
    })

    it("should sign user in despite cases", (done) => {
        agent.post('/api/signin')
        .send({email: testUsername, password: "password"})
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const json = JSON.parse(res.text)
            expect(json).to.equal(testLowercase)
            done()
        })
    })
})

describe("Group creation", () => {
    let group1Id
    let group2Id

    it("should create a group", (done) => {
        agent.post('/api/groups/')
        .send({name: "test group"})
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(201)
            const json = JSON.parse(res.text)
            group1Id = json._id
            done()
        })
    })

    it("should add a user to a group", (done) => {
        agent.post(`/api/groups/${group1Id}/join`)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(201)
            const json = JSON.parse(res.text)
            expect(json.members).to.contain(userId)
            done()
        })
    })

    it("should not add a user to a group twice", (done) => {
        agent.post(`/api/groups/${group1Id}/join`)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(409)
            const json = JSON.parse(res.text)
            expect(json).to.deep.equal({body: `user ${userId} already in group ${group1Id}`})
            done()
        })
    })

    it("should remove a user from a group", (done) => {
        agent.post(`/api/groups/${group1Id}/leave`)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(201)
            const json = JSON.parse(res.text)
            expect(json.members).to.not.contain(userId)
            done()
        })
    })

    it("should not remove a user from a group twice", (done) => {
        agent.post(`/api/groups/${group1Id}/leave`)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(409)
            const json = JSON.parse(res.text)
            expect(json).to.deep.equal({body: `user ${userId} not in group ${group1Id}`})
            done()
        })
    })

    it("should not add a user to a group that doesn't exist", (done) => {
        agent.post(`/api/groups/fakeid/join`)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(404)
            const json = JSON.parse(res.text)
            expect(json).to.deep.equal({body: `group with id fakeid not found`})
            done()
        })
    })

    it("should not remove a user from a group that doesn't exist", (done) => {
        agent.post(`/api/groups/fakeid/leave`)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(404)
            const json = JSON.parse(res.text)
            expect(json).to.deep.equal({body: `group with id fakeid not found`})
            done()
        })
    })

    it("should add another group", (done) => {
        agent.post('/api/groups/')
        .send({name: "test group 2"})
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(201)
            const json = JSON.parse(res.text)
            group2Id = json._id
            done()
        })
    })

    it("should get a list of all groups", (done) => {
        agent.get('/api/groups/')
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const json = JSON.parse(res.text)
            expect(json).to.containSubset([{name: "test group"}])
            done()
        })
    })

    it("should get a specific group", (done) => {
        agent.get(`/api/groups/${group1Id}`)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const json = JSON.parse(res.text)
            expect(json).to.containSubset({name: "test group"})
            done()
        })
    })

    it("should update a group", (done) => {
        agent.patch(`/api/groups/${group1Id}`)
        .send({name: "updated group"})
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(201)
            const json = JSON.parse(res.text)
            expect(json).to.containSubset({name: "updated group"})
            done()
        })
    })

    it("should delete a group", (done) => {
        agent.delete(`/api/groups/${group1Id}`)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const json = JSON.parse(res.text)
            expect(json).to.deep.equal({body: `group ${group1Id} deleted`})
            done()
        })
    })
})

describe("Death in space sheets", () => {
    let sheetId

    const disExample = {
        name: "test",
        stats: {
            dex: 0,
            bdy: -1,
            svy: 2,
            tech: 2
        },
        inventory: [{
            "name": "Example item",
            "description": "an example item for testing",
            "condition": 1,
            "maxCondition": 1,
            "weight": 2,
            "cost": 50,
        }],
        weapons: [{
            "base": {
              "weight": 1,
              "maxCondition": 3,
              "cost": 125,
              "name": "Vaccum Pistol"
            },
            "damage": "1d6",
            "modifier": "tech",
            "uses": 5,
            "type": "pistol"
          }],
        armor: [{
            "base": {
              "weight": 5,
              "cost": 400,
              "description": "donning time 30 minutes. Heavy and unwieldy, suitable only in low gravity environments. Power system with nitrogen- propelled thrusters. Protects against jagged rocks and radiation.",
              "name": "Heavy EVA Suit"
            },
            "drBonus": 2,
            "protectsAgainst": "Melee Weapons",
            "type": "EVA"
          }],
        background: "depressed student",
        drive: "spite",
        looks: "disheveled",
        pastAllegiance: "an idea",
        holos: 5,
        mutations: ["65395a78e96e8723e5f4abda"],
        hitPoints: 6,
        origin: "65384ce29bdcfb6515e78a2f",
        originBenefit: 0
    }

    let invalidExample = {...disExample}
    invalidExample.name = undefined
    invalidExample.hitPoints = "4"
    const newInventory = [{
        "name": "Example item",
        "description": "an example item for testing",
        "condition": 1,
        "maxCondition": 1,
        "weight": 2,
        "cost": 50,
    }, {
        name: "second example",
    }]
    const newStats = {
        dex: 0,
        bdy: 1,
        svy: 2,
        tech: 3
    }
    const edit = {characterName: "test", inventory: newInventory, stats:newStats}
    const editedObject = {...disExample, inventory:newInventory, characterName: "test", stats: newStats, name: undefined}

    after(()=>{
        agent.close()
        resetDb()
    })

    it("should create a random charactersheet", (done) => {
        agent.post('/api/dis/sheets/random')
        .send({name: "test"})
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(201)
            const json = JSON.parse(res.text)
            sheetId = json._id
            done()
        })
    })

    it("should look for charactersheets", (done) => {
        agent.get(`/api/sheets/${sheetId}`)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const json = JSON.parse(res.text)
            expect(json._id).to.equal(sheetId)
            expect(json.characterName).to.equal('test')
            done()
        })
    })

    it("should fail to find a charactersheet", (done) => {
        agent.get(`/api/sheets/${userId}`)
        .end((err,res) => {
            expect(err).to.be.null
            expect(res).to.have.status(404)
            done()
        })
    })

    it("should delete the charactersheet", (done) => {
        agent.delete(`/api/sheets/${sheetId}`)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const json = JSON.parse(res.text)
            expect(json).to.deep.equal({body: `sheet ${sheetId} deleted`})
            

            const uPromise = UserSheetMapping.find({sheet: sheetId}).exec()
            const sPromise = DeathInSpaceSheet.find({_id:sheetId}).exec()
            Promise.all([uPromise, sPromise])
            .then(([udocs, sdocs]) => {
                expect(udocs.length).to.equal(0)
                expect(sdocs.length).to.equal(0)
                done()
            })
        })
    })
    
    it("should fail to delete a charactersheet", (done) => {
        agent.delete(`/api/sheets/${userId}`)
        .end((err,res) => {
            expect(err).to.be.null
            expect(res).to.have.status(404)
            done()
        })
    })
    
    it("should manually create a charactersheet", (done) => {
        agent.post('/api/dis/sheets/create')
        .send(disExample)
        .end((err, resp) => {
            expect(err).to.be.null
            expect(resp).to.have.status(201)

            const json = JSON.parse(resp.text)
            sheetId = json._id
            const p1 = UserSheetMapping.find({}).exec()
            const p2 = DeathInSpaceSheet.find({}).exec()
            Promise.all([p1, p2]).then(([mappings, sheets]) => {
                expect(sheets).to.not.be.null
                expect(sheets.length).to.equal(1)
                expect(sheets[0]._id.toString()).to.equal(sheetId)
                expect(mappings).to.not.be.null
                expect(mappings.length).to.equal(1)
                expect(mappings[0].sheet.toString()).to.equal(sheetId)
                expect(mappings[0].user.toString()).to.equal(userId)
                done()
            }).catch(e =>{done(e)})
        })
    })

    it("should not create a charactersheet with invalid params", (done) => {
        agent.post('/api/dis/sheets/create')
        .send(invalidExample)
        .end((err, resp) => {
            expect(err).to.be.null
            expect(resp).to.have.status(403)
            const p1 = UserSheetMapping.find({}).exec()
            const p2 = DeathInSpaceSheet.find({}).exec()
            Promise.all([p1, p2]).then(([mappings, sheets]) => {
                expect(sheets).to.not.be.null
                expect(sheets.length).to.equal(1)
                expect(mappings).to.not.be.null
                expect(mappings.length).to.equal(1)
                done()
            }).catch(e =>{done(e)})
        })
    })

    it("should edit a prexisting charactersheet", (done) => {
        agent.patch(`/api/dis/sheets/edit/${sheetId}`)
        .send(edit)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const json = JSON.parse(res.text)
            expect(json).to.containSubset(editedObject)
            const p1 = UserSheetMapping.find({}).exec()
            const p2 = DeathInSpaceSheet.find({}).exec()
            Promise.all([p1, p2]).then(([mappings, sheets]) => {
                expect(sheets).to.not.be.null
                expect(sheets.length).to.equal(1)
                expect(sheets[0]._id.toString()).to.equal(sheetId)
                expect(mappings).to.not.be.null
                expect(mappings.length).to.equal(1)
                expect(mappings[0].sheet.toString()).to.equal(sheetId)
                expect(mappings[0].user.toString()).to.equal(userId)
                //check to ensure other fields do exist too,
                //doing this by checking maxHitPoints which gets set automatically
                expect(sheets[0].maxHitPoints).to.equal(json.maxHitPoints)
                done()
            }).catch(e =>{done(e)})
        })
    })

    it("should fail to find a charactersheet with invalid id", (done) => {
        agent.get('/api/sheets/fakeid')
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(400)
            done()
        })
    })

    it("should fail to delete a charactersheet with invalid id", (done) => {
        agent.get('/api/sheets/fakeid')
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(400)
            done()
        })
    })

    it('should get a list of all dis origins', (done) => {
        agent.get('/api/dis/origins')
        .end(async (err, res) =>{
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const numRecords = await DISOrigin.countDocuments({})
            const json = JSON.parse(res.text)
            expect(json.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            DISOrigin.find({_id: {$in: json.map(o => o._id)}}).exec().then((docs) => {
                expect(docs.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
                done()
            }).catch(e => done(e))
        })
    })

    it('should get a list of all dis mutations', (done) => {
        agent.get('/api/dis/mutations')
        .end(async (err, res) =>{
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const numRecords = await DISMutation.countDocuments({})
            const json = JSON.parse(res.text)
            expect(json.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            DISMutation.find({_id: {$in: json.map(d => d._id)}}).exec().then((docs) => {
                expect(docs.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
                done()
            }).catch(e => done(e))
        })
    })

    it('should get a list of all dis items', (done) => {
        agent.get('/api/dis/items')
        .end(async (err, res) =>{
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const numRecords = await DISInventoryItem.countDocuments({})
            const json = JSON.parse(res.text)
            expect(json.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            DISInventoryItem.find({_id: {$in: json.map(d => d._id)}}).exec().then((docs) => {
                expect(docs.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
                done()
            }).catch(e => done(e))
        })
    })

    it('should get a list of all dis weapons', (done) => {
        agent.get('/api/dis/weapons')
        .end(async (err, res) =>{
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const numRecords = await DISWeapon.countDocuments({})
            const json = JSON.parse(res.text)
            expect(json.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            DISWeapon.find({_id: {$in: json.map(d => d._id)}}).exec().then((docs) => {
                expect(docs.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
                done()
            }).catch(e => done(e))
        })
    })

    it('should get a list of all dis Armor', (done) => {
        agent.get('/api/dis/armor')
        .end(async (err, res) =>{
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const numRecords = await DISArmor.countDocuments({})
            const json = JSON.parse(res.text)
            expect(json.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            DISArmor.find({_id: {$in: json.map(d => d._id)}}).exec().then((docs) => {
                expect(docs.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
                done()
            }).catch(e => done(e))
        })
    })

    it('should get a list of all dis startequp', (done) => {
        agent.get('/api/dis/startequip')
        .end(async (err, res) =>{
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const numRecords = await DISStartingEquipment.countDocuments({})
            const json = JSON.parse(res.text)
            expect(json.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            DISStartingEquipment.find({_id: {$in: json.map(d => d._id)}}).exec().then((docs) => {
                expect(docs.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
                done()
            }).catch(e => done(e))
        })
    })

})