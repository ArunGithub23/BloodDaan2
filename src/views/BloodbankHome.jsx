import { Col, Container, Row } from "react-bootstrap";
import CustomNavbar from "../components/CustomNavbar";
import { useContext, useEffect, useState,useCallback } from "react";

import ProfileCard from "../components/ProfileCard";
import { useNavigate } from "react-router-dom";
import globalContext from "../context/GlobalUserContext";
import DonarCard from "../components/DonarCard";
import { useContract } from "@thirdweb-dev/react";
import FetchFromAadhar from "../dummyAPI/fetchAadhar";
import Preloader from "../components/Preloader";
import Web3 from "web3";

export default function BloodbankHome(props) {
  // will svae blockchain data in it
  const [data, setData] = useState([]);
  const [bloodCount, setCount] = useState(2);
  const [account,setAccount]=useState('');
  const [contract,setcontract]=useState('')
  const [artifact,setartifact]=useState('');
  
  var curBloodCount = 1;

  const { user } = useContext(globalContext);

  // const generateSampleData = () => {
    
  
  //   // Define the number of donors you want to generate
  //   const numberOfDonors = 10;
  // const data1=[];
  //   // Generate data for each donor
  //   for (let i = 0; i < numberOfDonors; i++) {
  //     const donor = {
  //       Name:"arun",
  //       adharNo: `ADHAR-${Math.floor(Math.random() * 1000000)}`, // Random ADHAR number
  //       collectionDate: new Date().toISOString(), // Current date as collection date
  //       bloodId: `BLOOD-${i}`, // Unique blood ID
  //       bloodGroup: ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'][Math.floor(Math.random() * 8)], // Random blood group
  //       verified: Math.random() < 0.5, // Random boolean value for verification status
  //     };
  
  //     data1.push(donor);
  //   }
  
  //   setData(data1)
  //   console.log("data is",data1)
  // };

  
  
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


  const navigate = useNavigate();

  // fetch data from chain

  async function fetchChainData() {
    try {
      // to save all available blood Donor at current Blood Bank
      console.log("check2")
      const bloodDataArray = [];
      // getting no og blood
      curBloodCount = parseInt(await contract.methods.getBloodCount().call({ from: account[0] }));
      console.log("check3",curBloodCount)
      // initialising all blood count to zero
      var bloodGroupCount = {
        "A +ve": 0,
        "A -ve": 0,
        "B +ve": 0,
        "B -ve": 0,
        "O +ve": 0,
        "O -ve": 0,
        "AB +ve": 0,
        "AB -ve": 0,
      };
      console.log("check4")
      for (let blood = 0; blood <= curBloodCount; blood++) {
        console.log("check5")
        // getting no of status updates
        const statusCount = await contract.methods.getBloodStatusCount(blood).call({ from: account[0] });
        console.log("check6",statusCount)
        // getting status of a specific blood at its latest status
        const bloodStatus = await contract.methods.getBloodStatus(
          blood,
          statusCount
        ).call({ from: account[0] });
        console.log("check7",bloodStatus)
        var time = bloodStatus[0];
        var owner = bloodStatus[2];
        var verified = bloodStatus[3];

        console.log("username",user.name,owner)
        // if current blood bank and owner of current blood sample if smae get its furthur details
        if (user.name.toLowerCase().trim() === owner.toLowerCase().trim()) {
          // getting blood details as its of current blood bank
          console.log("check8")
          const bloodData = await contract.methods.getBloodData( blood).call({ from: account[0] });
          console.log("check9",bloodData)
          var bloodID = bloodData[0];
          var aadhar = bloodData[1];
          var bloodGroup = bloodData[2];
          var expiryDate = bloodData[3];
          // incrementing blood count
          bloodGroupCount[bloodGroup] = bloodGroupCount[bloodGroup] + 1;

          // creating object to get Donor Details
          var tempDonor = {
            id: blood,
            bloodId: bloodID,
            adharNo: aadhar,
            bloodGroup: bloodGroup,
            verified: verified,
            owner: owner,
            collectionDate: new Date(1000 * time)
              .toLocaleString("en-GB")
              .split(" ")[0]
              .replaceAll("/", " / "),
            expiryDate: expiryDate.replaceAll("/", " / "),
          };
          console.log("check10",tempDonor)
          bloodDataArray.push(tempDonor);
        }
      }
      setCount(bloodGroupCount);
      setData(bloodDataArray);
    } catch (error) {
      console.log("Error in getting data", error);
    }
  }

  function updateStatus(e, d, idx) {
    e.preventDefault();
    navigate("/update-status", {
      state: {
        id: d.id,
        bloodId: d.bloodId,
        email: FetchFromAadhar(d.adharNo).Email,
        name: FetchFromAadhar(d.adharNo).Name,
        adharNo: d.adharNo,
        bloodGroup: d.bloodGroup,
        age: FetchFromAadhar(d.adharNo)["Age"] + " Years",
        verified: d.verified,
        collectionDate: d.collectionDate,
        expiryDate: d.expiryDate,
        owner: d.owner,
        currentBloodBank: user.name,
        cardId: idx,
        entireData: d,
        countdict: bloodCount,
        walletAddress: FetchFromAadhar(d.adharNo).address,
      },
    });
  }

  useEffect(() => {

   // generateSampleData();
    document.body.classList.toggle("profile-page");
    fetchChainData();
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.toggle("profile-page");
    };
  }, []);

  if (data && bloodCount) {
    return (
      <>
        <CustomNavbar url="bloodBankHome" />
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
              type={user.type}
              bloodCount={bloodCount}
              email={user.email}
              add={user.add}
            />
          </div>
          <Container className="text-center mt-5">
            <h3>Donor Data</h3>
            <Row>
              {data.map((d, idx) => {
                return (
                  <Col>
                    <DonarCard
                      no={d.adharNo}
                      collectionDate={d.collectionDate}
                      bloodID={d.bloodId}
                      bloodGroup={d.bloodGroup}
                      verified={d.verified.toString()}
                      onClick={(e) => updateStatus(e, d, idx)}
                    />
                  </Col>
                );
              })}
            </Row>
          </Container>
        </div>
      </>
    );
  } else {
    return <Preloader />;
  }
}
