import React, { useRef, useEffect, useState, useCallback } from "react";
import ReactToPrint from "react-to-print";
import logo from "../Images/cict-logo.png";
import "./Pages.css";
import dayjs from "dayjs";
import { auth, db, firestore, storage } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { ref } from "firebase/storage";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Chart from "react-google-charts";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ComponentToPrint = React.forwardRef((props, componentRef) => {
  
  const filteredData = props.filtered
  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(dayjs().format("MMMM D, YYYY").toString());
  });
  

  const printRef = collection(db, "documents");
  const [printData, setPrintData] = useState([]);
  const [users, setUsers] = useState([]);
  const getTableData = async () => {
    const q = query(printRef, props.dataFromParent == "Communication" || props.dataFromParent =="Memorandum"  ? where("document_Type", "==", props.dataFromParent) :  where("document_Type", "not-in", ["Communication", "Memorandum"]));
    const data = await getDocs(q);
    const userq = query(collection(db, "Users"))
    const userData = await getDocs(userq)
    setUsers(userData.docs.map((doc) => ({...doc.data(), id: doc.id})))
    setPrintData(data.docs.map((doc) => ({ ...doc.data(), id: doc.id, dateTime: new Date(doc.data().date_Received) })));
  };

  useEffect(() => {
    getTableData();
  }, [props]);

  const [sortedPrint, setSortedPrint] = useState([])
  const [sortedSet, setSortedSet] = useState([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [chartIncoming, setChartIncoming] = useState(0)
  const [chartOutgoing, setChartOutgoing] = useState(0)
  const [chartInternal, setChartInternal] = useState(0)
  const [chartExternal, setChartExternal] = useState(0)
  useEffect(() => {
    filteredData.forEach((doc) => {
      const Type = doc.Remark
      const Type2 = doc.Type
      if(Type == "Incoming"){
        setChartIncoming(prev => prev + 0.5)
      }
      else if(Type == "Outgoing"){
        setChartOutgoing(prev => prev + 0.5)
      }
      if(Type2 == "Internal Communication"){
        setChartInternal(prev => prev + 0.5)
      }
      else if(Type2 == "External Communication"){
        setChartExternal(prev => prev + 0.5)
      }
      const [timePart, ampm] = doc.time_Received.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      if (ampm === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
      doc.time = new Date();
      doc.time.setHours(hours);
      doc.time.setMinutes(minutes);
    })

    const timeFiltered = filteredData.sort((a, b) => b.time - a.time)

    timeFiltered.sort((a, b) => {
        if (b.dateTime.getFullYear() !== a.dateTime.getFullYear()) {
          return b.dateTime.getFullYear() - a.dateTime.getFullYear();
        } else if (b.dateTime.getMonth() !== a.dateTime.getMonth()) {
          return b.dateTime.getMonth() - a.dateTime.getMonth();
        } else {
          return b.dateTime.getDate() - a.dateTime.getDate();
        }
    })

    const printSet = new Set()
    timeFiltered.forEach((doc) =>  {
      const fieldValue = doc.Type != undefined ? doc.Type : doc.document_Type;
      printSet.add(fieldValue)
    })

    setSortedSet(Array.from(printSet))
    setSortedPrint(timeFiltered)
    setDateFrom(filteredData.length != 0 && timeFiltered[timeFiltered.length - 1].date_Received)
    setDateTo(filteredData.length != 0 && timeFiltered[0].date_Received)
  },[filteredData])

  const data = [
    ["Type", "Incoming", "Outgoing"],
    ["Type", chartIncoming, chartOutgoing],

  ];

  const options = {
    title: `Incoming and Outgoing ${props.dataFromParent} Documents`,
    chartArea: { width: "90%", height: "50%" },
    hAxis: {
      title: "Incoming/Outgoing",
      minValue: 0,
    },
    vAxis: {
      title: "Type",
    },
    legend: {
      position: "bottom"
    }
  };

  const Piedata = [
    ["Task", "Hours per Day"],
    ["Internal", chartInternal],
    ["External", chartExternal],

  ];

  const Pieoptions = {
    title: "Internal and External Communications Distribution",
    pieSliceText: 'value', // Display value and percentage
    pieSliceTextStyle: {
      color: 'white',   // Text color
      fontSize: 14,    // Font size
    },
  };
  const Piedata2 = [
    ["Types", "Count"],
    ...sortedSet.map((doc) => [doc, sortedPrint.filter(item => item.Type !== undefined ? item.Type === doc : item.document_Type === doc).length])

  ];

  const Pieoptions2 = {
    title: "Document Types Distribution",
    pieSliceText: 'value', // Display value and percentage
    pieSliceTextStyle: {
      color: 'white',   // Text color
      fontSize: 14,    // Font size
    },
    
  };

  
  return(
    <>
    <div className="print-holder" ref={componentRef}>
      <div className="print-top" id="header">
        <div className="print-logo">
          <img src={logo} alt="" />
        </div>
        <div className="print-title">
          <h1>Dean's Office Transaction Reports</h1>
        </div>
      </div>
      <div className="print-info">
        <div className="dateFrom"><span>From Date: </span>{dateFrom}</div>
        <div className="dateTo"><span>To Date: </span>{dateTo}</div>
      </div>
      
      <div className="print-charts">
          <Chart
            chartType="BarChart"
            data={data}
            options={options}
            width='100%'  // Set the width to 100% for responsiveness
            height="200px"  // Set an initial height, which can be adjusted
            style={{marginLeft: "50px", marginRight: "50px"}}
          />
          {props.dataFromParent == "Communication" && (
            <Chart
            chartType="PieChart"
            data={Piedata}
            options={Pieoptions}
            width={"100%"}
            height={"200px"}
            style={{marginLeft: "50px", marginRight: "50px"}}
          />
          )}

          {props.dataFromParent == "Others" && (
            <Chart
            chartType="PieChart"
            data={Piedata2}
            options={Pieoptions2}
            width={"100%"}
            height={"200px"}
            style={{marginLeft: "50px", marginRight: "50px"}}
          />
          )}

          
          
      </div>
      <span style={{width: "100%", marginLeft: "70px", fontSize: "1.2rem"}}>{`${props.dataFromParent} Documents Table`}</span>
      <div className="print-table">
          <table className="print-wholeTable">
            <tr>
              <th>Date Received/Sent</th>
              <th>Document Name</th>
              <th>Document Type</th>
              <th>Received By</th>
              <th>Office/Dept</th>
              <th>Contact Person</th>
              <th>Status</th>
            </tr>
              {filteredData.map((print, index) => {
                return(
                  <tr key={print.uID} style={index === 4 ? { pageBreakAfter: 'always' } : (index > 4 && (index - 4) % 12 === 0) ? { pageBreakAfter: 'always' } : {}}>
                    <td>{print.date_Received}</td>
                    <td>{print.document_Name}</td>
                    <td>{print.Type == undefined || print.Type == "" ? print.document_Type : print.Type}</td>
                    <td>{print.received_By}</td>
                    <td>{print.fromDep != undefined && print.fromDep != "" ? print.fromDep : print.fromPer}</td>
                    <td>{print.fromPer}</td>
                    <td>{print.Status}</td>
                  </tr>
                )
              })}
          </table>
          
      </div>
      <div className="print-footer">
        <Box>
          <Typography sx={{fontWeight: 'bold', fontSize: "0.9rem"}}>
            Printed By
          </Typography>
          <Typography sx={{fontSize: '0.9rem'}}>
            {users.find(item => item.UID == auth.currentUser.uid)?.full_Name}
          </Typography>
        </Box>
        
        
      </div>
    </div>
    </>
  );
});