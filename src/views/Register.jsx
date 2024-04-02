import { useContext, useEffect, useState,useCallback } from "react";
import CustomNavbar from "../components/CustomNavbar";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import globalContext from "../context/GlobalUserContext";
import Preloader from "../components/Preloader";
import { useNavigate } from "react-router-dom";
import {
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react";
//import { addIdentity, connectWallet } from '../config';
import Web3 from "web3";

export default function Register() {
  const [squares1to6, setSquares1to6] = useState("");
  const [squares7and8, setSquares7and8] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [add, setAdd] = useState("");
  const [type, setType] = useState("");
  const [alertMessage, setAlert] = useState("");
  const [account,setAccount]=useState('');
  const [contract,setcontract]=useState('')
  const [artifact,setartifact]=useState('');

  const [isLoading, setLoading] = useState(false);

  const [showAlert, setShow] = useState(false);

  const { setUserHelper } = useContext(globalContext);

  const navigate = useNavigate();
  //connect to wallet
//   const getAddress=async()=>{
//     connectWallet().then((res)=>setAccount(res)); 
// }

  // const { contract } = useContract("0x5f2e178f4c811ed44fa684fb6037b6d715b631ca53bc34fc235ece2edb052fa4");


  // //const account = useAddress();
  // const account="0xf7b44a90f91d80Cf64d2DB77F51Aa1F386fA6843";


  // // To check if account exist or not
  // const { data } = useContractRead(contract, "getIdentity", account);

  // const { mutateAsync: addIdentity } = useContractWrite(
  //   contract,
  //   "addIdentity"
  // );

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
    
    document.body.classList.toggle("register-page");
    document.documentElement.addEventListener("mousemove", followCursor);
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.toggle("register-page");
      document.documentElement.removeEventListener("mousemove", followCursor);
    };
  }, []);
  const followCursor = (event) => {
    let posX = event.clientX - window.innerWidth / 2;
    let posY = event.clientY - window.innerWidth / 6;
    setSquares1to6(
      "perspective(500px) rotateY(" +
        posX * 0.05 +
        "deg) rotateX(" +
        posY * -0.05 +
        "deg)"
    );
    setSquares7and8(
      "perspective(500px) rotateY(" +
        posX * 0.02 +
        "deg) rotateX(" +
        posY * -0.02 +
        "deg)"
    );
  };

  async function formSubmit(e) {
    console.log("contract is",contract)
    e.preventDefault();
    var accExist = false;
    if (accExist) {
      setAlert("Account Exist with current Wallet :" + account);
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    } else if (
      name === "" ||
      email === "" ||
      pass === "" ||
      (type !== "Blood Bank" && type !== "Hospital") ||
      add === ""
    ) {
      setAlert("Complete the form");
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    }
    // add to blockchain
    else {
      try {
        setLoading(true);
        let coords;
        // setting fixed coords due to non availibility of free geocoder
        if (type === "Blood Bank") {
          coords = "28.71154455678884,77.1556677910753";
        } else {
          coords = "28.527718654318228,77.21201605513441";
        }
        //await addIdentity(name, account, email, pass, add, coords, type);
       // await contract.methods.addIdentity("arun",account[0],"abc123@gmail.com","abc123","nsp","5778","Blood Bank").send({ from: account[0] });
       await contract.methods.addIdentity(name,account[0],email,pass,add,coords,type).send({ from: account[0] });
        var curUser = {
          name: name,
          email: email,
          address: add,
          coords: coords,
          type: type,
        };
        setUserHelper(curUser);
        // redirect to home after registering
        if (type === "Blood Bank") navigate("/bloodbank-home");
        else navigate("/hospital-home");
      } catch (error) {
        console.log("User Registration Error: ", error);
      }
    }
  }

  if (!isLoading) {
    return (
      <>
        <CustomNavbar url="register" />
        <div className="wrapper">
          <div className="page-header" style={{}}>
            <div className="page-header-image" />
            <div className="content m-0  mt-5 p-5">
              <Container>
                <Alert show={showAlert} variant="info">
                  {alertMessage}
                </Alert>
                <Row>
                  <Col className="offset-lg-0 offset-md-3" lg="5" md="6">
                    <div
                      className="square square-7"
                      id="square7"
                      style={{ transform: squares7and8 }}
                    />
                    <div
                      className="square square-8"
                      id="square8"
                      style={{ transform: squares7and8 }}
                    />
                    <Card className="card-register">
                      <Card.Header>
                        <Card.Img
                          alt="..."
                          src={require("../assets/img/square-purple-1.png")}
                        />
                        <Card.Title tag="h4">register</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <Form>
                          <Form.Group className="mb-3">
                            <Form.Control
                              type="text"
                              placeholder="Enter Org Name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                            ></Form.Control>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Control
                              type="email"
                              placeholder="Enter Email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Control
                              type="password"
                              placeholder="Enter Password"
                              value={pass}
                              onChange={(e) => setPass(e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Control
                              className="mb-3"
                              as="textarea"
                              placeholder="Enter Address"
                              rows="2"
                              value={add}
                              onChange={(e) => setAdd(e.target.value)}
                            ></Form.Control>
                          </Form.Group>
                          <Form.Group>
                            <Form.Select
                              className="form-control"
                              value={type}
                              onChange={(e) => {
                                setType(e.target.value);
                              }}
                            >
                              <option value="">Select Org Type</option>
                              <option>Hospital</option>
                              <option>Blood Bank</option>
                            </Form.Select>
                          </Form.Group>
                        </Form>
                      </Card.Body>
                      <Card.Footer>
                        <Button
                          className="btn-round"
                          color="primary"
                          size="lg"
                          onClick={formSubmit}
                        >
                          Get Started
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                </Row>
                <div
                  className="square square-1"
                  id="square1"
                  style={{ transform: squares1to6 }}
                />
                <div
                  className="square square-2"
                  id="square2"
                  style={{ transform: squares1to6 }}
                />
                <div
                  className="square square-3"
                  id="square3"
                  style={{ transform: squares1to6 }}
                />
                <div
                  className="square square-4"
                  id="square4"
                  style={{ transform: squares1to6 }}
                />
                <div
                  className="square square-5"
                  id="square5"
                  style={{ transform: squares1to6 }}
                />
                <div
                  className="square square-6"
                  id="square6"
                  style={{ transform: squares1to6 }}
                />
              </Container>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <Preloader />;
  }
}
