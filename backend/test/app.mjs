import chai from "chai";
import chaiHttp from "chai-http";
import { DEFAULTLIMIT, connectToDb, getMappings, getUsers, server } from "../src/app.mjs";
import { User, UserSheetMapping } from "../src/schemas.mjs";
import { DISArmor, DISInventoryItem, DISMutation, DISOrigin, DISStartingEquipment, DISWeapon, DeathInSpaceSheet } from "../src/deathInSpace/schema.mjs";
import { getDISSheets } from "../src/deathInSpace/routes.mjs";
import mongoose from "mongoose";
import chaiSubset from 'chai-subset'
import { MHMoves, MHSkin, MonsterHeartSheet } from "../src/monsterHearts/schema.mjs";
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

async function resetSheets(){
    const promises = []
    promises.push(DeathInSpaceSheet.deleteMany({}))
    promises.push(UserSheetMapping.deleteMany({}))
    promises.push(MonsterHeartSheet.deleteMany({}))
    await Promise.all(promises)
    return
}

async function resetDb(){
    const promises = []
    promises.push(User.deleteMany({}))
    promises.push(MHMoves.deleteMany({isCore: false}))
    resetSheets()
    promises.push(Group.deleteMany({}))
    await Promise.all(promises)
}

describe("sainity tests", () => {
    before(()=>{
        resetDb()
    })
  
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

describe("Death in space sheets", () => {
    after(()=>{
       resetSheets()
    })
    let sheetId

    const disExample = {
        characterName: "test",
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
    invalidExample.characterName = undefined
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
    const editedObject = {...disExample, inventory:newInventory, characterName: "test", stats: newStats}

    it("should create a random charactersheet", (done) => {
        agent.post('/api/dis/sheets/random')
        .send({characterName: "test"})
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
        agent.patch(`/api/dis/sheets/${sheetId}`)
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

    it("should generate a QR code for the sheet", (done) => {
        agent.get(`/api/sheets/${sheetId}/qr`)
        .end((err, res)=>{
            expect(err).to.be.null
            expect(res).to.have.status(200)
            done()
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
            expect(json.records.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            DISOrigin.find({_id: {$in: json.records.map(o => o._id)}}).exec().then((docs) => {
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
            expect(json.records.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            DISMutation.find({_id: {$in: json.records.map(d => d._id)}}).exec().then((docs) => {
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
            expect(json.records.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            DISInventoryItem.find({_id: {$in: json.records.map(d => d._id)}}).exec().then((docs) => {
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
            expect(json.records.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            DISWeapon.find({_id: {$in: json.records.map(d => d._id)}}).exec().then((docs) => {
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
            expect(json.records.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            DISArmor.find({_id: {$in: json.records.map(d => d._id)}}).exec().then((docs) => {
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
            expect(json.records.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            DISStartingEquipment.find({_id: {$in: json.records.map(d => d._id)}}).exec().then((docs) => {
                expect(docs.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
                done()
            }).catch(e => done(e))
        })
    })

})

describe("Testing monster hearts", () => {
    after(()=>{
        agent.close()
       resetDb()
    })

    let sheetId
    const sheetReq = {
        "characterName" : "test",
        "skin": "6551717def129323a9655e7b",
        "statOption": 1,
        "strings": [{"originator": "Casper",
            "description": "owes",
            "destination": "Kyle"}],
        "origin": "fae stuff",
        "look": "depressed",
        "eyes": "soft",
        "notes": "this is a test",
        "moves": ["65521a4ea2c2b43349178976"]
    }

    const editObj = {strings: [{
        "originator": "Kyle",
        description: "hates",
        "destination": "tests"
    }]}

    const editedMHSheet = {...sheetReq, ...editObj}

    it("should get a list of skins", (done) => {
        agent.get("/api/mhearts/skins")
        .end(async (err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const numRecords = await MHSkin.countDocuments({})
            const json = JSON.parse(res.text)
            expect(json.records.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            MHSkin.find({_id: {$in: json.records.map(o => o._id)}}).exec().then((docs) => {
                expect(docs.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
                done()
            }).catch(e => done(e))
        })
    })

    it("should get a list of moves", (done) => {
        agent.get("/api/mhearts/moves")
        .end(async (err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const numRecords = await MHMoves.countDocuments({})
            const json = JSON.parse(res.text)
            expect(json.records.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            MHMoves.find({_id: {$in: json.records.map(o => o._id)}}).exec().then((docs) => {
                expect(docs.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
                done()
            }).catch(e => done(e))
        })
    })

    it("should query specific types of moves", (done) => {
        agent.get("/api/mhearts/moves?type=hex")
        .end(async (err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const numRecords = await MHMoves.countDocuments({type:"hex"})
            const json = JSON.parse(res.text)
            expect(json.records.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
            MHMoves.find({_id: {$in: json.records.map(o => o._id)}}).exec().then((docs) => {
                expect(docs.length).to.equal(Math.min(numRecords, DEFAULTLIMIT))
                done()
            }).catch(e => done(e))
        })
    })

    it("should manually create a monsterhearts sheet", (done) => {
        agent.post('/api/mhearts/sheets/create')
        .send(sheetReq)
        .end((err, resp) => {
            expect(err).to.be.null
            expect(resp).to.have.status(201)
            const json = JSON.parse(resp.text)
            sheetId = json._id
            expect(json).to.containSubset({...sheetReq})
            const p1 = UserSheetMapping.find({}).exec()
            const p2 = MonsterHeartSheet.find({}).exec()
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

    it("should test creating an invalid monster hearts sheet", (done) => {
        agent.post('/api/mhearts/sheets/create')
        .send({...sheetReq, statOption:-1})
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(400)
            MonsterHeartSheet.find({}).exec().then(docs => {
                expect(docs.length).to.equal(1)
                done()
            }).catch((e) => done(e))
        })
    })

    it("should test editing a monster hearts sheet", (done) => {
        agent.patch(`/api/mhearts/sheets/${sheetId}`)
        .send(editObj)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const json = JSON.parse(res.text)
            expect(json).to.containSubset(editedMHSheet)
            const p1 = UserSheetMapping.find({}).exec()
            const p2 = MonsterHeartSheet.find({}).exec()
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

    it("should test an invalid edit on a monsterhearts sheet", (done) => {
        agent.patch(`/api/mhearts/sheets/${sheetId}`)
        .send({"moves": 6, "owner": new mongoose.Types.ObjectId()})
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(400)
            done()
        })
    })

    it("should generic get on the sheet", (done) => {
        agent.get(`/api/sheets/${sheetId}`)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const json = JSON.parse(res.text)
            expect(json._id).to.equal(sheetId)
            expect(json.characterName).to.equal(editedMHSheet.characterName)
            done()
        })
    })

    it("should test image upload on sheet", (done) => {
        agent.post(`/api/sheets/${sheetId}/pic`)
        .attach("image", "./test/test_image.png")
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(201)
            done()
        })
    })

    it("should test image get on sheet", (done) => {
        agent.get(`/api/sheets/${sheetId}/pic`)
        .end((err, res)=>{
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res.type).to.equal('image/png')
            done()
        })
    })

    it('should test generic delete on the sheet', (done) => {
        agent.delete(`/api/sheets/${sheetId}`)
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            const json = JSON.parse(res.text)
            expect(json).to.deep.equal({body: `sheet ${sheetId} deleted`})
            

            const uPromise = UserSheetMapping.find({sheet: sheetId}).exec()
            const sPromise = MonsterHeartSheet.find({_id:sheetId}).exec()
            Promise.all([uPromise, sPromise])
            .then(([udocs, sdocs]) => {
                expect(udocs.length).to.equal(0)
                expect(sdocs.length).to.equal(0)
                done()
            })
        })
    })

    const exampleMove = {
        "skin": "6551717def129323a9655e7b",
        "name": "test",
        "description": "this is a test move",
    }

    const dirtyExample = {...exampleMove, isCore: true} //should ignore isCore

    it("should create a move in monsterHearts", (done) => {
        agent.post('/api/mhearts/moves')
        .send(dirtyExample)
        .end(async (err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(201)
            const json = JSON.parse(res.text)
            expect(json).to.containSubset({...exampleMove, belongsTo: exampleMove.skin, skin:undefined})
            expect(json.isCore).to.equal(false)
            MHMoves.countDocuments({isCore: false}).then(numNonCore => {
                expect(numNonCore).to.equal(1)
                MHMoves.findOne({exampleMove}).exec().then((doc) => {
                    expect(doc).to.not.be.null
                    done()
                }).catch(e => done(e))
            }).catch(e => done(e))
            
        })
    })


})