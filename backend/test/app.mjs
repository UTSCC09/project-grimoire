import chai from "chai";
import chaiHttp from "chai-http";
import { server } from "../../src/app.mjs";

const expect = chai.expect;
chai.use(chaiHttp);

const agent = chai.request.agent(server);

describe("sainity tests", () => {
    after(()=>{
        agent.close()
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