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

import Preloader from "../components/Preloader";
import globalContext from "../context/GlobalUserContext";
import { useNavigate } from "react-router-dom";
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import Web3 from "web3";
//import { isloginValid, getLoginDetails,connectWallet } from '../config';

export default function Login() {
  const [squares1to6, setSquares1to6] = useState("");
  const [squares7and8, setSquares7and8] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [account,setAccount]=useState('');
  const [contract,setcontract]=useState('')
  const [artifact,setartifact]=useState('');


  const [alertMessage, setAlert] = useState("");
  const [showAlert, setShow] = useState(false);

  const { user, setUserHelper } = useContext(globalContext);

  const navigate = useNavigate();

  
  // const { contract } = useContract(process.env.REACT_APP_CONTRACT_ADD);

  // const account = useAddress();

  // const { data } = useContractRead(contract, "getIdentity", account);

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
    
    if ( false) {
      setAlert("Account does not exist");
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    } else if (email === "" || pass === "") {
      setAlert("Complete the form");
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    } else {
      try {
        //checking if email pass if right
        var loginStatus = await contract.methods.isloginValid(
          account[0],
          email,
          pass
        ).call({ from: account[0] });
                    // Call the getLoginDetails method using .call()
contract.methods.getLoginDetails(account[0]).call((error, result) => {
  if (!error) {
      // Here, result will be an array containing the returned values
      const name = result[0];
      const typeID = result[1];
      const addressUser = result[2];
      const coords = result[3];

      // Now, you can store or use these values as needed
      console.log('Name:', name);
      console.log('Type ID:', typeID);
      console.log('Address:', addressUser);
      console.log('Coordinates:', coords);
  } else {
      console.error('Error:', error);
  }
});

        
        console.log("loginstatus",loginStatus)
        // email mismatch
        if (loginStatus === "1") {
          setAlert("Email does not match with account");
          setShow(true);
          setTimeout(() => setShow(false), 3000);
          // pass mismatch
        } else if (loginStatus === "2") {
          setAlert("Wrong Password");
          setShow(true);
          setTimeout(() => setShow(false), 3000);
          // email and pass match
        } else if (loginStatus === "3") {
          setLoading(true);

            // Call the getLoginDetails method using .call()
contract.methods.getLoginDetails(account[0]).call((error, result) => {
  if (!error) {
      // Here, result will be an array containing the returned values
      const name = result[0];
      const typeID = result[1];
      const addressUser = result[2];
      const coords = result[3];

      // Now, you can store or use these values as needed
      console.log('Name:', name);
      console.log('Type ID:', typeID);
      console.log('Address:', addressUser);
      console.log('Coordinates:', coords);
  } else {
      console.error('Error:', error);
  }
});

          var userData = await contract.methods.getLoginDetails(account[0]).call({ from: account[0] });
          console.log("userdata",userData)
          var curUser = {
            name: userData[0],
            email: email.toString(),
            add: userData[2],
            coords: userData[3],
            type: userData[1],
          };
          setUserHelper(curUser);
          // redirect to home after registering
          if (userData[1] === "Blood Bank") navigate("/bloodbank-home");
          else navigate("/hospital-home");
        }
      } catch (err) {
        console.log("Login Error: ", err);
      }
    }
  }

  if (!isLoading) {
    return (
      <>
        <CustomNavbar url="login" />
        <div className="wrapper">
          <div className="page-header">
            <div className="page-header-image" />
            <div className="content">
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
                        <Card.Title tag="h4">Login</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <Form>
                          <Form.Group className="my-3">
                            <Form.Control
                              type="email"
                              placeholder="Enter Email"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                              }}
                            />
                          </Form.Group>
                          <Form.Group className="my-3">
                            <Form.Control
                              type="password"
                              placeholder="Enter Password"
                              value={pass}
                              onChange={(e) => {
                                setPass(e.target.value);
                              }}
                            />
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
                <div className="register-bg" />
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
