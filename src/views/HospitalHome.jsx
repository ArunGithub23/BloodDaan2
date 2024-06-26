import {
  Badge,
  Button,
  Col,
  Container,
  Form,
  FormSelect,
  InputGroup,
  Modal,
  Row,
} from "react-bootstrap";
import CustomNavbar from "../components/CustomNavbar";

import { useContext, useEffect, useRef, useState ,useCallback} from "react";

import ProfileCard from "../components/ProfileCard";
import globalContext from "../context/GlobalUserContext";

import FetchFromAadhar from "../dummyAPI/fetchAadhar";
import GetDistance from "../dummyAPI/GetDistance";

import { sha256 } from "js-sha256";
import QrReader from "react-qr-reader";
import { useContract, useContractWrite } from "@thirdweb-dev/react";
import { addDoc, collection } from "firebase/firestore";
import db from "../firebase";
import Web3 from "web3";
export default function HospitalHome(props) {
  

  
  const { user } = useContext(globalContext);
  console.log("user",user)

  const [bloodToBeSearched, setBloodToBeSearched] = useState("select");

  const [foundBloodData, setFoundBlood] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(true);
  const [bloodbankCord, updateBloodbankCord] = useState();
  const [showNotFound, setNotFound] = useState(false);
  const [email, setEmail] = useState("");
  const qrRef = useRef(null);
  const [code, setCode] = useState("");
  const [hash, setHash] = useState();
  const [account,setAccount]=useState('');
  const [contract,setcontract]=useState('')
  const [artifact,setartifact]=useState('');

 //web 3 starts
 const init = useCallback(
  async artifact => {
    if (artifact) {
      console.log("okk")
      const web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
      console.log("web3",web3);
      console.log("okk7")
      const accounts1 = await web3.eth.requestAccounts();
      console.log("okk6")
      setAccount(accounts1)
      console.log("okk4")
      const networkID = await web3.eth.net.getId();
      console.log("okk5")
      const { abi } = artifact;
      console.log("okk3")
      let address, contract1;
      try {
        console.log("hello")
        address = artifact.networks[networkID].address;
        contract1 = new web3.eth.Contract(abi, address);
        console.log("contractttt",contract1)
        setcontract(contract1);
      } catch (err) {
        console.error(err);
      }
     
    }
  }, []);

useEffect(() => {
  const tryInit = async () => {
    try {
      const artifact1 = require("../build/contracts/Bloodtoken.json");
      console.log("arti",artifact1)
      setartifact(artifact1)
      init(artifact1);
    } catch (err) {
      console.error(err);
    }
  };

  tryInit();
}, [init]);

useEffect(() => {
  const events = ["chainChanged", "accountsChanged"];
  const handleChange = () => {
    init(artifact);
  };

  events.forEach(e => window.ethereum.on(e, handleChange));
  return () => {
    events.forEach(e => window.ethereum.removeListener(e, handleChange));
  };
}, [init, artifact]);

//web3 ends



  function handleUpload() {
    if (qrRef && qrRef.current) qrRef.current.openImageDialog();
  }

  function handleScan(data) {
    if (data) {
      setCode(data);
    }
    // var h = foundBloodData.aadharNo
    //   .replaceAll(" ", "")
    //   .concat(foundBloodData.uniqueID);
    var h="78925b36da2a8ee5b5129a75816f06bd68c430f560e16aee47287e05be51f7ed";
    setHash(sha256(h));
  }

  function handleError(err) {
    console.error(err);
  }

  // To add user to waiting list
  async function handleNotify() {
    await addDoc(collection(db, "waitlist"), {
      email: email,
      bloodGroup: bloodToBeSearched,
      timestamp: new Date(),
    }).catch((err) => console.log(err));
    alert("Added to waitlist");
  }

  async function search(e) {
    e.preventDefault();
    setLoading(true);
    if (bloodToBeSearched !== "select") {
      var b_count = parseInt(await contract.methods.getBloodCount().call({ from: account[0] }));
      var reqBlood = []; // multidimensioanl array with blood if distanct coords

      for (let i = 1; i <= b_count; ++i) {
        const bloodData = await contract.methods.getBloodData( i).call({ from: account[0] });
        const bloodStatusCount = parseInt(
          await contract.methods.getBloodStatusCount(i).call({ from: account[0] })
        );

        const bloodStatus = await contract.methods.getBloodStatus(
        
          i,
          bloodStatusCount
        ).call({ from: account[0] });
        var bloodGroup = bloodData[2];
        var owner = bloodStatus[2];
        var verified = parseInt(bloodStatus[3]);
        var bloodCoords = bloodStatus[1].split(",");
        var userCoords = user.coords.split(",");
        // checking if bloodGroup is same as req , its in blood bank and is safe
        if (
          bloodToBeSearched === bloodGroup &&
          verified === 1 &&
          owner.toString().toLowerCase().includes("blood")
        ) {
          let dis = GetDistance(
            parseFloat(bloodCoords[0]),
            parseFloat(userCoords[0]),
            parseFloat(bloodCoords[1]),
            parseFloat(userCoords[1])
          );
          reqBlood.push([
            i, //blood id,
            parseInt(dis),
            bloodStatus[1], // coordinates of blood bank
            owner, // name of blood bank
          ]);
        }
      }

      if (reqBlood.length === 0) {
        setLoading(false);
        setNotFound(true);
        return;
      }

      // sort on distance

      reqBlood.sort((a, b) => {
        return a[1] < b[1];
      });

      updateBloodbankCord(bloodCoords[0] + "," + bloodCoords[1]);

      var nearestBlood = reqBlood[0];
      // get detail of nearest blood

      var nearestBloodData = await contract.methods.getBloodData(
        
        nearestBlood[0]
      ).call({ from: account[0] });

      var nearestBloodStatusCount = await contract.methods.getBloodStatusCount(
        
        nearestBlood[0]
      ).call({ from: account[0] });
      var nearestBloodStatus = await contract.methods.getBloodStatus(
        
        nearestBlood[0],
        nearestBloodStatusCount
      ).call({ from: account[0] });

      var foundBloodTemp = {
        id: nearestBlood[0],
        uniqueID: nearestBloodData[0],
        email: FetchFromAadhar(nearestBloodData[1])["Email"],
        name: FetchFromAadhar(nearestBloodData[1])["Name"],
        aadharNo: nearestBloodData[1],
        bloodGroup: nearestBloodData[2],
        age: FetchFromAadhar(nearestBloodData[1])["Age"],
        expiryDate: nearestBloodData[3],
        currentBloodBank: nearestBloodStatus[2],
        verified: "1",
      };

      setFoundBlood(foundBloodTemp);
      setLoading(false);
      setModal(true);
    } else {
      alert(`${"Please Select a Blood Group"}`);
      setLoading(false);
    }
  }

   async function transferBlood() {
  //   await transferAsset([
  //     foundBloodData.id,
  //     foundBloodData.currentBloodBank,
  //     "1",
  //     user.coords,
  //     user.name,
  //   ]).then(() => {
  //     setModal(false);
  //     alert("Blood Transfer Successfully");
  //   });
  }

  useEffect(() => {
    document.body.classList.toggle("profile-page");
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.toggle("profile-page");
    };
  }, []);

  return (
    <>
      <CustomNavbar url="hospitalHome" />
      <div className="wrapper p-10 mb-2" style={{ background: "#fd5d93" }}>
        <div className="page-header">
          <img
            style={{ opacity: 0.2 }}
            alt="..."
            className="dots"
            src={require("../assets/img/dots.png")}
          />
          <img
            style={{ opacity: 0.2 }}
            alt="..."
            className="path"
            src={require("../assets/img/path4.png")}
          />
          <ProfileCard
            name={user.name}
            type={user.address}
            bloodCount={{}}
            email={user.email}
            add={user.address}
          />
          <Container className="hospitalContainer pt-5 text-center">
            <h2>Ask For Blood</h2>
            <Row>
              <Col></Col>
              <Col className="searchContainer" style={{ zIndex: "99" }}>
                <h3>Blood Group of Patient :</h3>
                <FormSelect
                  className="form-control my-3"
                  name="selectedBloodGroup"
                  value={bloodToBeSearched}
                  onChange={(e) => setBloodToBeSearched(e.target.value)}
                >
                  <option value="select">Select</option>
                  <option value="A +ve">A +ve</option>
                  <option value="A -ve">A -ve</option>
                  <option value="B +ve">B +ve</option>
                  <option value="B -ve">B -ve</option>
                  <option value="O +ve">O +ve</option>
                  <option value="O -ve">O -ve</option>
                  <option value="AB +ve">AB +ve</option>
                  <option value="AB -ve">AB -ve</option>
                </FormSelect>
                <Button className="mt-3" onClick={search}>
                  {!loading ? "Search for Blood " : "Searching For Blood"}
                </Button>
                {showNotFound && (
                  <Modal show={showNotFound} toggle={() => setNotFound(false)}>
                    <div className="modal-header justify-content-center pt-0">
                      <h4 className="title title-up">Blood Not Found</h4>
                    </div>
                    <Modal.Body style={{ color: "black" }}>
                      <p className="px-3 text-justify">
                        Blood Not found. If you want to be added to waitlist
                        enter your email
                      </p>
                    </Modal.Body>
                    <div className="modal-footer mb-3">
                      <InputGroup className="mb-3">
                        <Form.Control
                          style={{ color: "black", fontSize: 16, width: 50 }}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                          }}
                          placeholder="Email"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                        />
                      </InputGroup>
                      {email && (
                        <Button
                          variant="primary"
                          type="button"
                          onClick={handleNotify}
                        >
                          Add To Waitlist
                        </Button>
                      )}
                      <Button
                        variant="dark"
                        onClick={() => {
                          setNotFound(false);
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  </Modal>
                )}
                {modal && (
                  <Modal show={modal} toggle={() => setModal(false)}>
                    <div className="modal-header justify-content-center pt-0">
                      <h4 className="title title-up">Blood Details</h4>
                    </div>
                    <Modal.Body style={{ color: "black" }}>
                      <p className="px-3 text-justify">
                        Following are the details of the blood you will receive.
                        please verify the hash once blood is recieved
                      </p>
                      <div className="px-3 pt-2">
                        <div>
                          <h5 style={{ color: "black" }}>
                            <b className="mr-4">Name:</b>
                            {foundBloodData.name}
                          </h5>
                        </div>
                        <div>
                          <h5 style={{ color: "black" }}>
                            <b className="mr-4">Email ID:</b>
                            {foundBloodData.email}
                          </h5>
                        </div>
                        <div>
                          <h5 style={{ color: "black" }}>
                            <b className="mr-4">Aadhar No: </b>
                            {foundBloodData.aadharNo}
                          </h5>
                        </div>
                        <div>
                          <h5 style={{ color: "black" }}>
                            <b className="mr-4">Blood ID: </b>
                            {foundBloodData.uniqueID}
                          </h5>
                        </div>
                        <div>
                          <h5 style={{ color: "black" }}>
                            <b className="mr-4">Blood Group: </b>
                            {foundBloodData.bloodGroup}
                          </h5>
                        </div>
                        <div>
                          <h5 style={{ color: "black" }}>
                            <b className="mr-4">Received from : </b>
                            {foundBloodData.currentBloodBank}
                          </h5>
                        </div>
                        <div>
                          <h5 style={{ color: "black" }}>
                            <b className="mr-4">Expiry Date : </b>
                            {foundBloodData.expiryDate}
                          </h5>
                        </div>
                        <div>
                          <h5 style={{ color: "black" }}>
                            <b className="mr-4">Age: </b>
                            {foundBloodData.age}
                          </h5>
                        </div>
                        <div>
                          <h5 style={{ color: "black" }}>
                            <b className="mr-4">Verification Status: </b>
                            {foundBloodData.verified === "0" && (
                              <Badge
                                bg="warning"
                                className="py-1"
                                style={{ color: "black" }}
                              >
                                Not yet Tested
                              </Badge>
                            )}

                            {foundBloodData.verified === "1" && (
                              <Badge bg="success" className="py-1">
                                Tested {"&"} Safe
                              </Badge>
                            )}

                            {foundBloodData.verified === "2" && (
                              <Badge bg="danger" className="py-1">
                                Tested {"&"} Unsafe
                              </Badge>
                            )}
                          </h5>
                        </div>
                        <div>
                          <h5 class="card-title">
                            <b className="mr-4 ">
                              <a
                                target="1"
                                href={
                                  "http://google.com/maps?q=" +
                                  bloodbankCord +
                                  "&ll=" +
                                  bloodbankCord +
                                  "&z=20"
                                }
                              >
                                See on Maps:{" "}
                              </a>
                            </b>
                            <div className="row justify-content-center  mt-2">
                              <iframe
                                style={{ borderStyle: "solid" }}
                                borderStyle="solid"
                                title="maps"
                                src={
                                  "http://google.com/maps?q=" +
                                  bloodbankCord +
                                  "&ll=" +
                                  bloodbankCord +
                                  "&z=20&output=embed"
                                }
                                height="300"
                                width="420"
                              ></iframe>
                            </div>
                          </h5>
                        </div>
                      </div>
                    </Modal.Body>
                    <div className="modal-footer mb-3">
                      <Button
                        variant="primary"
                        type="button"
                        onClick={handleUpload}
                      >
                        Scan and Check
                      </Button>
                      {code && code === hash && (
                        <Button onClick={transferBlood}>Transfer</Button>
                      )}
                      <Button
                        variant="dark"
                        onClick={() => {
                          setModal(false);
                          setCode("");
                          setHash("");
                        }}
                      >
                        Close
                      </Button>
                    </div>
                    <Row>
                      <Col>
                        <QrReader
                          ref={qrRef}
                          delay={300}
                          onError={handleError}
                          // style={{ width: "40%" }}
                          onScan={handleScan}
                          legacyMode={true}
                        />
                      </Col>
                      <Col>
                        {code && (
                          <div className="row px-3">
                            <div className="col m-3">
                              <h6 style={{ color: "black" }}>Hash from QR :</h6>
                              {code && (
                                <span>{code.substring(0, 15) + " ..."}</span>
                              )}
                              <hr />
                              <h6 style={{ color: "black" }}>
                                Hash generated :{" "}
                              </h6>
                              {hash && (
                                <span>{hash.substring(0, 15) + " ..."}</span>
                              )}
                              <hr />
                              {code === hash && (
                                <Badge bg="success" className="py-1">
                                  Hash verification successful
                                </Badge>
                              )}

                              {code !== hash && (
                                <Badge bg="danger" className="py-1">
                                  Hash verification unsuccessful
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Modal>
                )}
              </Col>
              <Col></Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
}
