import CustomNavbar from "../components/CustomNavbar";
import globalContext from "../context/GlobalUserContext";
import { useContext, useEffect, useState,useCallback } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import FetchFromAadhar from "../dummyAPI/fetchAadhar";
import { useContract, useContractWrite } from "@thirdweb-dev/react";
import Preloader from "../components/Preloader";
import Web3 from "web3";

export default function BloodCollection() {
  const { user } = useContext(globalContext);
  const [data, setData] = useState({
    bloodId: "",
    aadharNo: "",
    bloodGroup: "",
    verified: false,
    collectionDate: new Date().toLocaleString().split(",")[0],
    location: "",
  });

  const [alertMessage, setAlert] = useState("");
  const [showAlert, setShow] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [account,setAccount]=useState('');
  const [contract,setcontract]=useState('')
  const [artifact,setartifact]=useState('');

  const navigate = useNavigate();



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



  

  
  useEffect(() => {
    document.body.classList.toggle("index-page");
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.toggle("index-page");
    };
  }, []);

  function inputChangeHandler(e) {
    const { name, value } = e.target;
    const data1= {
      aadharNo:"817445853880",
      Name: "Bharat Malik",
      Email: "bharatmalik1999@gmail.com",
      Age: 22,
      address: "0x1a04dC29daae2A322EEB3f78E45D6F23434faf9B",
    }
    setData(data1)
    // setData((prevVal) => {
    //   return {
    //     ...prevVal,
    //     [name]: value,
    //   };
    // });
  }

  async function formSubmit(e) {
    e.preventDefault();
   // var bloodExist = await contract.methods.bloodExist(data.bloodId).call({ from: account[0] });

   var bloodExist =false
    console.log("bloodexist",bloodExist)

    if (data.bloodId === "" || data.aadharNo === "" || data.bloodGroup === "") {
      console.log("user1 is ",user)
      setAlert("complete the form");
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    } 
    
    // else if (FetchFromAadhar(data.aadharNo) === undefined) {
    //   console.log("user2 is ",user)
    //   setAlert("Aadhar not present in database");
    //   setShow(true);
    //   setTimeout(() => setShow(false), 3000);
    // }
    else if (bloodExist === true) {
      console.log("user3 is ",user)
      setAlert("Blood ID exists");
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    } else {
      try {
        setLoading(true);
        console.log("user4 is ",user)
        await  contract.methods.addBloodUnit(
          "2",
          "8174 4585 3880",
          "O+",
          // expiry
          new Date(Date.now() + 42 * 86400000)
            .toLocaleString("en-GB")
            .split(" ")[0],
          // to save blood bank name
          "nikhil",
          "127782617",
        ).send({ from: account[0] });
        navigate("/bloodbank-home");
      } catch (err) {
        console.log("Error in creation");
      }
    }
  }

  if (!isLoading) {
    return (
      <>
        <CustomNavbar url="bloodBankHome" />
        <div style={{ paddingTop: "100px" }} className="wrapper">
          <div className="page-header header-filter">
            <div className="squares square1" />
            <div className="squares square2" />
            <div className="squares square3" />
            <div className="squares square4" />
            <div className="squares square5" />
            <div className="squares square6" />
            <div className="squares square7" />
            <Container style={{ marginTop: "100px" }}>
              <Alert show={showAlert} variant="info">
                {alertMessage}
              </Alert>
              <Row>
                <Col></Col>
                <Col>
                  <Card className="card-register">
                    <Card.Header>
                      <Card.Img
                        alt="..."
                        src={require("../assets/img/square-purple-1.png")}
                      />
                      <Card.Title tag="h4">Details</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <Form>
                        <Form.Group controlId="bloodIDInput">
                          <Form.Label>Blood ID</Form.Label>
                          <Form.Control
                            name="bloodId"
                            type="text"
                            placeholder="Blood ID"
                            value={data.bloodId}
                            onChange={inputChangeHandler}
                          ></Form.Control>
                        </Form.Group>
                        <Form.Group controlId="aadharNoInput">
                          <Form.Label>Aadhar No</Form.Label>
                          <Form.Control
                            name="aadharNo"
                            type="text"
                            placeholder="Aadhar No"
                            value={data.aadharNo}
                            onChange={inputChangeHandler}
                          ></Form.Control>
                        </Form.Group>
                        <Form.Group controlId="bloodGroupInput">
                          <Form.Label>Blood Group</Form.Label>
                          <Form.Select
                            className="form-control"
                            name="bloodGroup"
                            value={data.bloodGroup}
                            onChange={inputChangeHandler}
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
                          </Form.Select>
                        </Form.Group>
                      </Form>
                    </Card.Body>
                    <Card.Footer>
                      <Button
                        className="mt-2"
                        type="submit"
                        onClick={formSubmit}
                      >
                        Submit
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
                <Col></Col>
              </Row>
            </Container>
          </div>
        </div>
      </>
    );
  } else {
    return <Preloader />;
  }
}
