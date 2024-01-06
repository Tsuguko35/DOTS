import { useEffect, useState, useRef } from "react";
import "./Pages.css";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { auth, db, firestore, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { deleteObject, getDownloadURL, getMetadata, listAll, ref, uploadBytes } from "firebase/storage";
import { ComponentToPrint } from "./Printing";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import noresult from "../Images/noresults.png";
import {
    Autocomplete,
  Badge,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  ImageList,
  ImageListItem,
  InputAdornment,
  InputLabel,
  Menu,
  Switch,
  Tab,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import Swal from "sweetalert2";
import TextField from "@mui/material/TextField";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import FilterListIcon from "@mui/icons-material/FilterList";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import letter from "../Images/letter.png";
import ReactToPrint from "react-to-print";
import dayjs from "dayjs";
import TurnRightTwoToneIcon from '@mui/icons-material/TurnRightTwoTone';
import { LocalizationProvider,  DatePicker, TimePicker } from "@mui/x-date-pickers";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import toast, { Toaster } from "react-hot-toast";
import SearchIcon from '@mui/icons-material/Search';
import ArchiveIcon from '@mui/icons-material/Archive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import styled from "styled-components";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import pdfIcon from '../Images/pdf.png'
import docxIcon from '../Images/docx.png'
import xlsIcon from '../Images/xls.png'
import Lightbox from "react-image-lightbox";
import 'react-image-lightbox/style.css';
import DocViewer, { DocViewerRenderers }  from "@cyntler/react-doc-viewer";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { BitlyClient } from "bitly";
import { CloudDownload } from "@mui/icons-material";
import docxViewIcon from '../Images/docxView.png'
import xlsxViewIcon from '../Images/xlsxView.png'
import RefreshIcon from '@mui/icons-material/Refresh';
import emailjs from '@emailjs/browser';
import axios from "axios";
import JSZip from "jszip";

export default function StickyHeadTable() {
  const port = "http://localhost:3001"
  axios.defaults.withCredentials = true
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleWindowResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });
  //INPUT
  const bitly = new BitlyClient('c478862f511d94ce205a9d7ef4329d6a2b2feea5')
  const newPlugin = defaultLayoutPlugin();
  const pagePlugin = pageNavigationPlugin();
  //INPUTS
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [sumbmit, setSumbmit] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [emptyResult, setEmptyResult] = useState(false);

  const [newDateReceived, setNewDateReceived] = useState("");
  const [newDocumentName, setNewDocumentName] = useState("")
  const [newComment, setNewComment] = useState("")
  const [newSched_Date, setNewSched_Date] = useState("")
  const [newSched, setNewSched] = useState("")
  const [newForwardTo, setNewForwardTo] = useState("")
  const [newTimeReceived, setNewTimeReceived] = useState("");
  const [newReceivedBy, setNewReceivedBy] = useState("");
  const [newFromDep, setNewFromDep] = useState('');
  const [newFromPer, setNewFromPer] = useState("");
  const [newType, setNewType] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIncomingOutgoing, setNewIncomingOutgoing] = useState("Incoming");
  const [newRE, setNewRE] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTransmitted, setNewTransmitted] = useState("");
  const [newStatus, setNewStatus] = useState("Pending");
  const uniqueID = uuid();
  const componentRef = useRef();
  const [imageUpload, setImageUpload] = useState();
  const [urgent, setUrgent] = useState(false)

  const incomingCollectionRef = collection(db, "documents");
  const logcollectionRef = collection(db, "logs");
  const [userInfo, setUserInfo] = useState([]);
  const [userHolder, setuserHolder] = useState(null);
  const [openRows, setOpenRows] = useState({})
  const [categoryPick, setCategoryPick] = useState("")
  const [category, setCategory] = useState("")

  useEffect(() => {
    setCategory(categoryPick)
  },[categoryPick])

  const handleClickOpen = () => {
    setNewDateReceived(dayjs())
    setNewTimeReceived(dayjs())
    setOpenAdd(true);
  };

  const handleClose = () => {
    if(newDocumentName != "" || newSched_Date != "" || newSched != "" || newForwardTo != "" || newReceivedBy != "" || newFromDep != "" || newFromPer != "" || newType != "" || newDescription != ""){
      Swal.fire({
        text: "Confirm close? Inputed data will be deleted.", 
        showCancelButton: true,
        confirmButtonColor: "#FF5600",
        cancelButtonColor: "#888",
        confirmButtonText: "Confirm"}).then((result)=> {
          if(result.isConfirmed){
            setNewDateReceived("")
            setNewDocumentName("")
            setNewComment("")
            setNewSched_Date("")
            setNewSched("")
            setNewForwardTo("")
            setNewTimeReceived("")
            setNewReceivedBy("")
            setNewFromDep("")
            setNewFromPer("")
            setNewType("")
            setNewDescription("")
            setNewIncomingOutgoing("")
            setNewStatus("Pending")
            setImageUpload("")
            setEmptyResult(false);
            setSumbmit(false);
            setUrgent(false)
            getIncoming();
            setIsListenerActive(false)
            setCategory("")
            setImageDis([]);
            setOpenAdd(false);
          }
        })
    }else{
      setNewDateReceived("")
      setNewDocumentName("")
      setNewComment("")
      setNewSched_Date("")
      setNewSched("")
      setNewForwardTo("")
      setNewTimeReceived("")
      setNewReceivedBy("")
      setNewFromDep("")
      setNewFromPer("")
      setNewType("")
      setNewDescription("")
      setNewIncomingOutgoing("")
      setNewStatus("Pending")
      setImageUpload("")
      setEmptyResult(false);
      setSumbmit(false);
      setUrgent(false)
      getIncoming();
      setIsListenerActive(false)
      setCategory("")
      setImageDis([]);
      setOpenAdd(false);
    }
    
    
  };

  const handleEditOpen = () => {
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setImageDis([]);
    setEditImageHolder([]);
    setOpenEdit(false);
  };


  const form = useRef();
  const createIncoming = async (e) => {
    if (imageUpload == null) return;
    e.preventDefault();
    setSumbmit(true);


    if(urgent){
      emailjs.sendForm('service_rxiov6g', 'template_mkfbnwd', form.current, 'jVURHianJ2V6jHLHo')
      .then((result) => {
          toast.success("An email has been sent.")
      }, (error) => {
          toast.error("An error occured while sending the email.")
      });
    }
    let documentsToBeAdded = {}

    if(category == "Student Document"){
        documentsToBeAdded =  {
            document_Name: newDocumentName,
            fromPer: newFromPer,
            received_By: newReceivedBy,
            document_Type: category,
            date_Received: formatDate(newDateReceived),
            time_Received: formatTime(newTimeReceived),
            uID: uniqueID,
            Status: newStatus,
            Type: newType,
            Description: newDescription,
            Comment: newComment,
            forward_To: newForwardTo,
            Remark: newIncomingOutgoing,
            deleted_at: "",
            urgent: urgent ? 1 : 0,
            unread: 1
          };
    }
    else if (category == "Faculty Document"){
        documentsToBeAdded =  {
            document_Name: newDocumentName,
            fromPer: newFromPer,
            fromDep: newFromDep,
            received_By: newReceivedBy,
            document_Type: category,
            date_Received: formatDate(newDateReceived),
            time_Received: formatTime(newTimeReceived),
            uID: uniqueID,
            Status: newStatus,
            Type: newType,
            Description: newDescription,
            Comment: newComment,
            forward_To: newForwardTo,
            Remark: newIncomingOutgoing,
            deleted_at: "",
            urgent: urgent ? 1 : 0,
            unread: 1
          };
    }
    else if (category == "New Hire Document"){
        documentsToBeAdded =  {
            document_Name: newDocumentName,
            fromPer: newFromPer,
            fromDep: newFromDep,
            received_By: newReceivedBy,
            document_Type: category,
            date_Received: formatDate(newDateReceived),
            time_Received: formatTime(newTimeReceived),
            uID: uniqueID,
            Status: newStatus,
            Type: newType,
            Description: newDescription,
            Comment: newComment,
            forward_To: newForwardTo,
            Remark: newIncomingOutgoing,
            deleted_at: "",
            urgent: urgent ? 1 : 0,
            unread: 1
          };
    }
    else if (category == "IPCR/OPCR"){
        documentsToBeAdded =  {
            document_Name: newDocumentName,
            fromPer: newFromPer,
            fromDep: newFromDep,
            received_By: newReceivedBy,
            document_Type: category,
            date_Received: formatDate(newDateReceived),
            time_Received: formatTime(newTimeReceived),
            uID: uniqueID,
            Status: newStatus,
            Type: newType,
            Description: newDescription,
            Comment: newComment,
            forward_To: newForwardTo,
            Remark: newIncomingOutgoing,
            deleted_at: "",
            urgent: urgent ? 1 : 0,
      unread: 1
          };
    }
    else if (category == "Travel Order"){
        documentsToBeAdded =  {
            document_Name: newDocumentName,
            fromPer: newFromPer,
            fromDep: newFromDep,
            received_By: newReceivedBy,
            document_Type: category,
            date_Received: formatDate(newDateReceived),
            time_Received: formatTime(newTimeReceived),
            uID: uniqueID,
            Status: newStatus,
            Description: newDescription,
            Comment: newComment,
            forward_To: newForwardTo,
            Remark: newIncomingOutgoing,
            deleted_at: "",
            urgent: urgent ? 1 : 0,
            unread: 1
          };
    }
    else if (category == "Meeting Request"){
        documentsToBeAdded =  {
            document_Name: newDocumentName,
            fromPer: newFromPer,
            fromDep: newFromDep,
            received_By: newReceivedBy,
            document_Type: category,
            date_Received: formatDate(newDateReceived),
            time_Received: formatTime(newTimeReceived),
            uID: uniqueID,
            Status: newStatus,
            Sched: newSched,
            Sched_Date: formatDate(newSched_Date),
            Description: newDescription,
            Comment: newComment,
            forward_To: newForwardTo,
            Remark: newIncomingOutgoing,
            deleted_at: "",
            urgent: urgent ? 1 : 0,
            unread: 1
          };
    }
    else {
      documentsToBeAdded =  {
        document_Name: newDocumentName,
        fromPer: newFromPer,
        fromDep: newFromDep,
        received_By: newReceivedBy,
        document_Type: category,
        date_Received: formatDate(newDateReceived),
        time_Received: formatTime(newTimeReceived),
        uID: uniqueID,
        Status: newStatus,
        Type: newType,
        Description: newDescription,
        Comment: newComment,
        forward_To: newForwardTo,
        Remark: newIncomingOutgoing,
        deleted_at: "",
        urgent: urgent ? 1 : 0,
        unread: 1
      };
    }
    const formData = new FormData();
    imageUpload.forEach((file, index) => {
      formData.append(`files`, file)
    })

    formData.append('uID', documentsToBeAdded.uID);
    try{
      await axios.post(`${port}/documentFiles`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await axios.post(`${port}/documents`, documentsToBeAdded)  
      setNewDateReceived("")
      setNewDocumentName("")
      setNewComment("")
      setNewSched_Date("")
      setNewSched("")
      setNewForwardTo("")
      setNewTimeReceived("")
      setNewReceivedBy("")
      setNewFromDep("")
      setNewFromPer("")
      setNewType("")
      setNewDescription("")
      setNewIncomingOutgoing("")
      setNewStatus("Pending")
      setImageUpload("")
      setImageDis("")
      setOpenAdd(false)
      getSignInMethods("add", documentsToBeAdded.document_Name, documentsToBeAdded.document_Type);
      setEmptyResult(false);
      setSumbmit(false);
      setUrgent(false)
      getIncoming();
      setCategory("")
      toast.success("Successfully uploaded a file.")
    }catch(e){
      console.log(e);
    }
  };

  const formatDate = (date) => {
    return dayjs(date).format('MM/DD/YYYY');
  };

  const formatTime = (date) => {
    return dayjs(date).format('h:mm A');
  };
  //

  const getSignInMethods = async (type, name, docType) => {
    let log = null
    if (type == "add") {
      log = {
        date: dayjs().format("MMM D, YYYY h:mm A").toString(),
        log: user.full_Name + ` added an ${docType} Letter (${name}) ${newFromPer && 'from ' + newFromPer}`,
      }
    } else if (type == "edit") {
      log = {
        date: dayjs().format("MMM D, YYYY h:mm A").toString(),
        log: user.full_Name + ` edited an ${docType} Letter (${name}) ${editFromPer && 'from ' + editFromPer}`,
      };
    } else if (type == "archive") {
      log = {
        date: dayjs().format("MMM D, YYYY h:mm A").toString(),
        log: user.full_Name + ` archived a ${docType} Letter (${name})`,
      };
    }
    try{
      await axios.post(`${port}/createLog`, log)
    }catch(e){
      console.log(e.message);
    }
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState([]);
  useEffect(() => {
    const getUser = async() => {
      try{
        await axios.get(`${port}/getUser`).then((data) => {
          if(data.status == 200){
            setUser(data.data[0])
          }
        })
        await axios.get(`${port}/getUsers`).then((data) => {
          setUsers(data.data)
        })
      }catch(e){
        console.log(e);
      }
    }
    getUser()
  }, []);

  useEffect(() => {
    getIncoming();
  }, [page]);

  const [isListenerActive, setIsListenerActive] = useState(false);
  const getIncoming = async () => {
    const data = await axios.get(`${port}/documents?type=Other`)
    setRows(data.data);
    setLoading(false);
    if (data.data.length == 0) {
      setEmptyResult(true);
    }
  };

  // useEffect(() =>{
  //   const q = query(collection(db, "documents"), where("document_Type", "not-in", ["Communication", "Memorandum"], orderBy("desc")))
  //   const unsub = onSnapshot(q, async(data) => {
  //     data.docChanges().forEach((change) => {
  //       if(change.type === 'added'){
  //           toast("A document has been added, please refresh.", {
  //             icon: <NotificationsActiveIcon />,
  //           })
  //       }else if (change.type === 'modified'){
  //         toast("A document is edited, please refresh.", {
  //           icon: <NotificationsActiveIcon />,
  //         })
  //       }
  //       else if (change.type === 'removed'){
  //         toast("A document has been archived, please refresh.", {
  //           icon: <NotificationsActiveIcon />,
  //         })
  //       }
  //     })
  //   })
  //   return () => unsub()
  // }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const deleteIncoming = async(id, name, docType) => {
    toast.loading("Please wait...")
    try{
      await axios.get(`${port}/openFile?id=${id}`).then((data) => {
        toast.dismiss()
        if(data.data[0].Status != "Pending"){
          Swal.fire({
            title: "Archive?",
            text: "The document will be added to the archives.",
            icon: "info",
            iconColor: "#FF5600",
            showCancelButton: true,
            confirmButtonColor: "#FF5600",
            cancelButtonColor: "#888",
            confirmButtonText: "Archive doc",
            focusConfirm: true,
          }).then(async (result) => {
          if(result.isConfirmed) {
              try{
                await axios.post(`${port}/archiveFile?id=${id}&user=${user.uID}`)
                toast.success("File has been archived")
                getSignInMethods("archive", name, docType)
                getIncoming();
              }catch(e){
                console.log(e);
              }
            }
          });
        }else if (data.data[0].Status == "Pending"){
          Swal.fire({text: "Pending documents cannot be archived.", confirmButtonColor: "#FF5600",showConfirmButton: true})
        }
      })
    }catch(e){

    }

  };

  const archiveFile = async (id, data) => {
    const recentDoc = doc(collection(db, "archive"));
    await setDoc(recentDoc, data);
    await deleteDoc(doc(db, "documents", id));
    getSignInMethods("archive", data.document_Name);
    toast.success("File has been archived")
    getIncoming();
  };

  const [openShowFile, setOpenShowFile] = useState(false);
  const [displayFile, setDisplayFile] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [loading2, setLoading2] = useState(true);
  const [filePDF, setFilePDF] = useState([]);
  const [fileDocx, setFileDocx] = useState([]);
  const [fileXlsx, setFileXlsx] = useState([]);
  const [loading3, setLoading3] = useState(true);
  const openFile = (id) => {
    setLoading3(true)
    setOpenShowFile(true);
    showFile(id);
  };
  const showFile = async (id) => {
    const imageListRef = await axios.get(`${port}/getFile?id=${id}`);
    const data = await axios.get(`${port}/openFile?id=${id}`);
    setDisplayFile(data.data);
    imageListRef.data.forEach((item) => {
      console.log(item);
        if(item.file_Name.includes('.png') || item.file_Name.includes('.jpg') || item.file_Name.includes('.jpeg')){
            setImageList((prev) => [...prev, item.file_Name]);
        }
        else if (item.file_Name.includes('.pdf')){
                setFilePDF(item.file_Name);
        }
        else if (item.file_Name.includes('.docx') || item.file_Name.includes('.doc')){
              setFileDocx(item.file_Name);
        }
        else if (item.file_Name.includes('.xlsx')){
              setFileXlsx(item.file_Name);
        }
    });
    setLoading2(false);
  };

  const closeFile = async () => {
    await setOpenShowFile(false);
    setLoading2(true);
    setDisplayFile([]);
    setImageList([]);
    setFilePDF([]);
    setFileDocx([]);
    setFileXlsx([]);
  };

  
  const [openFilter, setOpenFilter] = useState(false);
  const [uniqueValuesArray, setUniqueValuesArray] = useState([]);
  const [years, setYears] = useState([]);
  const [from, setFrom] = useState([]);
  const filterOpen = async () => {
    const fetchData = async () => {
      const myCollectionRef = collection(db, "documents");
      const myQuery = query(myCollectionRef, where("document_Type", "not-in", ["Communication", "Memorandum"]));

      const querySnapshot = await getDocs(myQuery);
      const uniqueValues = new Set();
      const yearsDataArray = new Set();
      const fromDataArray = new Set();

      querySnapshot.forEach((doc) => {
        const fieldValue = doc.data().Type != undefined ? doc.data().Type : doc.data().document_Type;
        uniqueValues.add(fieldValue);
        const dateObject = new Date(doc.data().date_Received);
        yearsDataArray.add(dateObject.getFullYear());
        const fromObject = doc.data().document_Type;
        fromDataArray.add(fromObject);
      });
      const uniqueValuesArray = Array.from(uniqueValues);
      const yearsArray = Array.from(yearsDataArray);
      const fromArray = Array.from(fromDataArray);
      setYears(yearsArray);
      setFrom(fromArray);
      setUniqueValuesArray(uniqueValuesArray);
    };
    await fetchData();
    setOpenFilter(true);
  };

  const filterClose = () => {
    setOpenFilter(false);
  };

  const [formID, setFormID] = useState("");
  const [editDateReceived, setEditDateReceived] = useState("");
  const [editTimeReceived, setEditTimeReceived] = useState("");
  const [editReceivedBy, setEditReceivedBy] = useState("");
  const [editFromDep, setEditFromDep] = useState("");
  const [editFromPer, setEditFromPer] = useState("");
  const [editType, setEditType] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRE, setEditRE] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTransmitted, setEditTransmitted] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editDocType, setEditDocType] = useState("");
  const [editDocName, setEditDocName] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editSched_Date, setEditSched_Date] = useState("");
  const [editSched, setEditSched] = useState("");
  const [editImageHolder, setEditImageHolder] = useState([]);
  const [editImage, setEditImage] = useState([]);
  const editIncoming = async(
    id,
    dateRecieved,
    timeReceived,
    receivedBy,
    fromDep,
    fromPer,
    type,
    date,
    status,
    uID,
    remark,
    description,
    docuName,
    category,
    comment,
    sched_Date,
    meeting_Details
  ) => {
    const imageListRef = await axios.get(`${port}/getFile?id=${uID}`);
    console.log(imageListRef.data);
    imageListRef.data.forEach(async(item) => {
        const fileName = item.file_Name
        const fileSize = item.size
        setEditImageHolder((prev) =>{ return [...prev, { 
          name: fileName, 
          image: item.file_Name.includes('.png') || item.file_Name.includes('.jpg') || item.file_Name.includes('.jpeg') ? `${port}/document_Files/${item.file_Name}` : 
          item.file_Name.includes('.pdf') ? pdfIcon : 
          item.file_Name.includes('.doc') || item.file_Name.includes('.docx') ? docxIcon :
          item.file_Name.includes('.xlsx') || item.file_Name.includes('.xls') ? xlsIcon : '',
          size: fileSize
        }]});
    }); 
    
    const data = {
      id: id,
      fromDep: fromDep,
      fromPer: fromPer,
      received_By: receivedBy,
      document_Type: category,
      date_Received: dateRecieved,
      time_Received: timeReceived,
      uID: uID,
      Status: status,
      Type: type,
      Description: description,
      Sched_Date: sched_Date,
      Sched: meeting_Details,
      Comment: comment,
      Remark: "",
      deleted_at: "",
      document_Name: docuName,
    };
    setFormID(data);
    handleEditOpen();
  };

  const formatDateBack = (date) => {
    return dayjs(date);
  };

  const formatTimeBack = (date) => {
    return dayjs(date, "hh:mm A");
  };

  useEffect(() => {
    setEditImage(editImageHolder)
  },[editImageHolder])
  useEffect(() => {
    setEditDateReceived(formatDateBack(formID.date_Received))
    setEditTimeReceived(formatTimeBack(formID.time_Received))
    setEditReceivedBy(formID.received_By)
    setEditFromDep(formID.fromDep)
    setEditFromPer(formID.fromPer)
    setEditType(formID.Type)
    setEditDescription(formID.Description)
    setEditDate(formatDateBack(formID.Date))
    setEditStatus(formID.Status)
    setEditDocType(formID.document_Type)
    setEditDocName(formID.document_Name)
    setEditComment(formID.Comment)
    setEditSched_Date(formatDateBack(formID.Sched_Date))
    setEditSched(formID.Sched)
  }, [formID]);

  const updateIncoming = async (e) => {
    e.preventDefault();
    setSumbmit(true);
    const editFields = {
        document_Name: editDocName,
        fromPer: editFromPer,
        received_By: editReceivedBy,
        date_Received: formatDate(editDateReceived),
        time_Received: formatTime(editTimeReceived),
        uID: formID.uID,
        Status: editStatus,
        Type: editType,
        Description: editDescription,
        Comment: editComment,
    };
    const editFields2 = {
        document_Name: editDocName,
        fromDep: editFromDep,
        fromPer: editFromPer,
        received_By: editReceivedBy,
        date_Received: formatDate(editDateReceived),
        time_Received: formatTime(editTimeReceived),
        uID: formID.uID,
        Status: editStatus,
        Type: editType,
        Description: editDescription,
        Comment: editComment,
      };
      const editFields3 = {
        document_Name: editDocName,
        fromDep: editFromDep,
        fromPer: editFromPer,
        received_By: editReceivedBy,
        date_Received: formatDate(editDateReceived),
        time_Received: formatTime(editTimeReceived),
        uID: formID.uID,
        Status: editStatus,
        Type: editType,
        Description: editDescription,
        Comment: editComment,
      };
      const editFields4 = {
        document_Name: editDocName,
        fromDep: editFromDep,
        fromPer: editFromPer,
        received_By: editReceivedBy,
        date_Received: formatDate(editDateReceived),
        time_Received: formatTime(editTimeReceived),
        uID: formID.uID,
        Status: editStatus,
        Type: editType,
        Description: editDescription,
        Comment: editComment,
      };
      const editFields5 = {
        document_Name: editDocName,
        fromDep: editFromDep,
        fromPer: editFromPer,
        received_By: editReceivedBy,
        date_Received: formatDate(editDateReceived),
        time_Received: formatTime(editTimeReceived),
        uID: formID.uID,
        Status: editStatus,
        Description: editDescription,
        Comment: editComment,
      };
      const editFields6 = {
        document_Name: editDocName,
        fromDep: editFromDep,
        fromPer: editFromPer,
        received_By: editReceivedBy,
        date_Received: formatDate(editDateReceived),
        time_Received: formatTime(editTimeReceived),
        uID: formID.uID,
        Status: editStatus,
        Description: editDescription,
        Sched_Date: formatDate(editSched_Date),
        Sched: editSched,
        Comment: editComment,
      };
    if (imageUpload == null) {
        try{
          if(editDocType == "Student Document"){
            await axios.put(`${port}/update`, editFields)
          }
          else if(editDocType == "Faculty Document"){
              await axios.put(`${port}/update`, editFields2)
          }
          else if(editDocType == "New Hire Document"){
              await axios.put(`${port}/update`, editFields3)
          }
          else if(editDocType == "IPCR/OPCR"){
              await axios.put(`${port}/update`, editFields4)
          }
          else if(editDocType == "Travel Order"){
              await axios.put(`${port}/update`, editFields5)
          }
          else if(editDocType == "Meeting Request"){
              await axios.put(`${port}/update`, editFields6)
          }
          setSumbmit(false);
        }catch(e){
          console.log(e);
        }
    } else if (imageUpload != null) {
      const formData = new FormData();
      imageUpload.forEach((file, index) => {
        formData.append(`files`, file)
      })
      formData.append(`uID`, formID.uID)
      try{
        if(editDocType == "Student Document"){
          await axios.put(`${port}/update`, editFields)
        }
        else if(editDocType == "Faculty Document"){
  
            await axios.put(`${port}/update`, editFields2)
        }
        else if(editDocType == "New Hire Document"){
  
            await axios.put(`${port}/update`, editFields3)
        }
        else if(editDocType == "IPCR/OPCR"){
  
            await axios.put(`${port}/update`, editFields4)
        }
        else if(editDocType == "Travel Order"){
  
            await axios.put(`${port}/update`, editFields5)
        }
        else if(editDocType == "Meeting Request"){
  
            await axios.put(`${port}/update`, editFields6)
        }
        await axios.put(`${port}/updateFile`, formData)
        setSumbmit(false);
        setImageUpload([])
      }catch(e){
        console.log(e);
      }
    }

    getSignInMethods("edit", editDocName, editDocType);
    getIncoming();
    handleEditClose();
    setIsListenerActive(false)
    toast.success("Successfully Edited.")
  };

  //bytes converter
  const bytesToSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  const [imageDis, setImageDis] = useState([]);
  const onImageChange = (event) => {
    setImageDis([]);
    setImageUpload();
    const fileAllowed = []
    const fileData = []
    const allowedFileTypes = [".png", ".jpg", ".jpeg", ".pdf", ".docx", ".doc", ".xlsx", ".xls"];
    if(event.target.files){
      Array.from(event.target.files).map((file) => {
        const extension = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
        if(allowedFileTypes.includes(`.${extension}`)){
          fileAllowed.push(file)
          const substringsToCheck = [".png" , ".jpg", ".jpeg"];
          const fileImage =  substringsToCheck.some(substring => file.name.endsWith(substring)) ? URL.createObjectURL(file) : file.name.endsWith(".pdf") ? pdfIcon : file.name.endsWith(".docx") ? docxIcon : file.name.endsWith("xls") ? xlsIcon : file.name.endsWith("xlsx") ? xlsIcon : ''
          const fileName = file.name;
          const fileSize = bytesToSize(file.size);
          fileData.push({name: fileName, image: fileImage, size: fileSize})
        }else{
          Swal.fire({text: "Files can only be Images, Pdf, Doc, Excel", confirmButtonColor: "#FF9944"})
          setImageDis([]);
          setImageUpload()
        }
      })
      setImageDis(fileData);
      setImageUpload(fileAllowed)
    }
    Array.from(event.target.files).map((file) => URL.revokeObjectURL(file));
  };


  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [filter2, setFilter2] = useState("");
  const [filter3, setFilter3] = useState("");
  const [filter4, setFilter4] = useState(false);
  const [filter5, setFilter5] = useState(false);
  const [filter6, setFilter6] = useState(false);
  const [filter7, setFilter7] = useState("");
  const [filter8, setFilter8] = useState("");
  const [filter9, setFilter9] = useState("");
  const [filter10, setFilter10] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filteredOptionsName, setFilteredOptionsName] = useState([]);
  const [filteredOptionsDocType, setFilteredOptionsDocType] = useState([]);
  const [filteredOptionsReceive, setFilteredOptionsReceive] = useState([]);
  const [filteredOptionsfromDep, setFilteredOptionsfromDep] = useState([]);
  const [filteredOptionsDateReceived, setFilteredOptionsDateReceived] = useState([]);
  const [filteredOptionsStatus, setFilteredOptionsStatus] = useState([]);
  useEffect(() => {
    const filteredOptionName = new Set()
    const filteredOptionDocType = new Set()
    const filteredOptionReceive = new Set()
    const filteredOptionfromDep = new Set()
    const filteredOptionDate = new Set()
    const filteredOptionStatus = new Set()
    const filtered = rows.filter((item) =>
      item.received_By.toLowerCase().includes(search.toLowerCase())||
      item.fromPer.toLowerCase().includes(search.toLowerCase()) ||
      item.document_Name.toLowerCase().includes(search.toLowerCase()) || 
      item.Description.toLowerCase().includes(search.toLowerCase()) || 
      item.Comment.toLowerCase().includes(search.toLowerCase())
    ).filter((item) =>
        item.document_Name == undefined ? item.document_Name.toLowerCase().includes(filter.toLowerCase()) : item.document_Name.toLowerCase().includes(filter.toLowerCase())
    ).filter((item) =>
        item.fromDep == undefined ? item.fromPer.toLowerCase().includes(filter9.toLowerCase()) :  item.fromDep.toLowerCase().includes(filter9.toLowerCase())
    ).filter((item) =>
        item.Type == undefined ? item.document_Type.toLowerCase().includes(filter8.toLowerCase()) : item.Type.toLowerCase().includes(filter8.toLowerCase())
    ).filter((item) => 
      item.received_By.toLowerCase().includes(filter2.toString().toLowerCase())
    ).filter((item) => 
      filter10 == "" || filter10 == null? item.date_Received.includes("") : item.date_Received.includes(dayjs(filter10).format('MM/DD/YYYY').toString())
    ).filter((item) =>
      filter3 != "" ? item.Status.toLowerCase() === filter3.toLowerCase(): item.Status.toLowerCase().includes("")
    ).filter((item) =>
      filter4 == true ? (new Date(item.date_Received).getFullYear()).toString().includes(dayjs().year().toString()) : (new Date(item.date_Received).getFullYear()).toString().includes("")
    ).filter((item) =>
      filter5 == true ? (new Date(item.date_Received).getMonth()).toString().includes(dayjs().month().toString()) : (new Date(item.date_Received).getMonth()).toString().includes("")
    ).filter((item) =>
      filter6 == true ? (new Date(item.date_Received).getDay()).toString().includes(dayjs().day().toString()) : (new Date(item.date_Received).getDay()).toString().includes("")
    )

  filtered.forEach(doc => {
      filteredOptionName.add(doc.document_Name)
      filteredOptionDocType.add(doc.Type == undefined ? doc.document_Type : doc.Type)
      filteredOptionReceive.add(doc.received_By)
      filteredOptionStatus.add(doc.Status)
      filteredOptionfromDep.add(doc.fromDep == undefined ? doc.fromPer : doc.fromDep)
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

   const timeFiltered = filtered.sort((a, b) => b.time - a.time)

   timeFiltered.sort((a, b) => {
    if (new Date(b.date_Received).getFullYear() !== new Date(a.date_Received).getFullYear()) {
      return new Date(b.date_Received).getFullYear() - new Date(a.date_Received).getFullYear();
    } else if (new Date(b.date_Received).getMonth() !== new Date(a.date_Received).getMonth()) {
      return new Date(b.date_Received).getMonth() - new Date(a.date_Received).getMonth();
    } else {
      return new Date(b.date_Received).getDate() - new Date(a.date_Received).getDate();
    }
    })


    console.log(filter10);
    setFilteredOptionsReceive(Array.from(filteredOptionReceive))
    setFilteredOptionsfromDep(Array.from(filteredOptionfromDep))
    setFilteredOptionsDocType(Array.from(filteredOptionDocType))
    setFilteredOptionsName(Array.from(filteredOptionName))
    setFilteredOptionsStatus(Array.from(filteredOptionStatus))
    setFilteredData(timeFiltered);
  }, [rows, search, filter, filter2, filter3, filter4, filter5, filter6, filter7, filter8, filter9, filter10]);

  const filterSearch = (e) => {
    setSearch(e.target.value)
  }

  //FILTEROPEN
  const [anchorEl1, setAnchorEl1] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [anchorEl3, setAnchorEl3] = useState(null);
  const [anchorEl4, setAnchorEl4] = useState(null);
  const [anchorEl5, setAnchorEl5] = useState(null);
  const [anchorEl6, setAnchorEl6] = useState(null);
  const open1 = Boolean(anchorEl1);
  const open2 = Boolean(anchorEl2);
  const open3 = Boolean(anchorEl3);
  const open4 = Boolean(anchorEl4);
  const open5 = Boolean(anchorEl5);
  const open6 = Boolean(anchorEl6);
  const handleFilter = (event, buttonNumber) => {
    if(buttonNumber === 1){
      setAnchorEl1(event.currentTarget);
    }
    else if(buttonNumber === 2){
      setAnchorEl2(event.currentTarget);
    }
    else if(buttonNumber === 3){
      setAnchorEl3(event.currentTarget);
    }
    else if(buttonNumber === 4){
      setAnchorEl4(event.currentTarget);
    }
    else if(buttonNumber === 5){
      setAnchorEl5(event.currentTarget);
    }
    else if(buttonNumber === 6){
      setAnchorEl6(event.currentTarget);
    }
  }
    
  const handleFilterClose = (event, buttonNumber) => {
    if(buttonNumber === 1){
      setAnchorEl1(null);
    }
    else if(buttonNumber === 2){
      setAnchorEl2(null);
    }
    else if(buttonNumber === 3){
      setAnchorEl3(null);
    }
    else if(buttonNumber === 4){
      setAnchorEl4(null);
    }
    else if(buttonNumber === 5){
      setAnchorEl5(null);
    }
    else if(buttonNumber === 6){
      setAnchorEl6(null);
    }
  };

  //Limit filter letters
  const limitFilterText = (text, limit) => {
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
  };

  //Upload file button
  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  //LightBox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index) => {
    setIsLightboxOpen(true);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  //Tab Pannel
  const [tabValue, setTabValue] = useState('1');
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDownload = (type) => {
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    if (type == "docx"){
      anchor.href = `${port}/document_Files/${fileDocx}`;
      anchor.download = fileDocx;
      anchor.target = '_blank';
      anchor.click();
    }
    else if(type == "xlsx"){
      anchor.href = `${port}/document_Files/${fileXlsx}`;
      anchor.download = fileXlsx;
      anchor.target = '_blank';
      anchor.click();
    }
    else if(type == "image"){
      if(imageList.length > 1){
        const zip = new JSZip()
        const promises = imageList.map((image, index) => {
          const imageUrl = `${port}/document_Files/${image}`;
          const filename = `${image}`;
  
          return fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => zip.file(filename, blob));
        });
  
        Promise.all(promises).then(() => {
          zip.generateAsync({ type: 'blob' }).then(blob => {
            const url = URL.createObjectURL(blob);
            anchor.href = url;
            anchor.download = `${displayFile[0].document_Name}.zip`;
  
            anchor.target = '_blank';
            anchor.click();
  
            URL.revokeObjectURL(url);
          });
        });
       
      }else{
        for(const image of imageList){
          const imageUrl = `${port}/document_Files/${image}`;
          fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
              const objectUrl = URL.createObjectURL(blob);
              anchor.href = objectUrl;
              anchor.download = image;
              anchor.target = '_blank';
              anchor.click();
              URL.revokeObjectURL(objectUrl);
              console.log(true);
            })
            .catch(error => {
              console.error('Error fetching image:', error);
            });
        }
      }
    }
    document.body.removeChild(anchor);
};

  const [rotation, setRotation] = useState(0);
  const refreshTable = () => {
    setRotation(rotation + 360);
    setRows([])
    setLoading(true)
    setEmptyResult(false)
    getIncoming()
  }

  const [office, setOffice] = useState([])
  const [categories, setCategories] = useState([])
  const [student, setStudent] = useState([])
  const [faculty, setFaculty] = useState([])
  const [hire, setHire] = useState([])
  useEffect(() => {
    getDropdowns()
  }, [])

  const getDropdowns = async() => {
    try{
      await axios.get(`${port}/getDropdowns`).then((data) => {
        setOffice(data.data.filter(item => item.option_For == "Office").map(filteredItem => filteredItem.option))
        setCategories(data.data.filter(item => item.option_For == "Categories").map(filteredItem => filteredItem.option))
        setStudent(data.data.filter(item => item.option_For == "Student").map(filteredItem => filteredItem.option))
        setFaculty(data.data.filter(item => item.option_For == "Faculty").map(filteredItem => filteredItem.option))
        setHire(data.data.filter(item => item.option_For == "Hire").map(filteredItem => filteredItem.option))
      })
    }catch(e){
      console.log(e.message);
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Toaster position="bottom-center"/>
    <Paper sx={{ width: "100%", overflow: "hidden", height: "100%", position: "relative" }}>
      <Box height={10} className="table-main" />
      <Stack
        className="table-main"
        direction={windowWidth <= 576 ? "column" : "row"}
        spacing={2}
        style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px" }}
      >
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          style={{fontSize:windowWidth <= 320 && "0.8rem", fontWeight: "bold" }}
          onClick={handleClickOpen}
        >
          ADD NEW DOCUMENT
        </Button>
        <Typography sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
          <Tooltip title={<Typography sx={{fontSize: "0.8rem"}}>Refresh</Typography>} arrow>
            <RefreshIcon sx={{fontSize: "35px",  transform: `rotate(${rotation}deg)`, transition: 'transform 1s'}} className="refresh-icon" onClick={refreshTable}/>
          </Tooltip>
        </Typography>

        </Box>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1 }}
        ></Typography>
        <ReactToPrint
          trigger={() => {
            return (
              <Button
                disabled={!users}
                variant="contained"
                startIcon={<LocalPrintshopIcon />}
                style={{ background: "#FF5600", fontWeight: "bold" }}
              >
                PRINT
              </Button>
            );
          }}
          content={() => componentRef.current}
          documentTitle="Incoming Documents"
          pageStyle='
                @page {
                  size: landscape
                  @bottom-left{
                    content: "Printed by Secretary"
                  }
                  @bottom-right{
                    content: "Page " counter(page)
                  }
                }
              '
        />
        <FormControl variant="standard">
          <TextField
            value={search}
            className = "table-input"
            size="small"
            variant="outlined"
            onChange={filterSearch}
            InputProps={{
              placeholder: "Document Name, Description",
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </FormControl>
      </Stack>
      <TableContainer
        className="table-main"
        sx={{maxHeight: "540px", tableLayout: "fixed", pl: "2vh", pr: "2vh", userSelect: "none" }}
      >
        <Table stickyHeader aria-label="sticky table">
        <TableHead>
            <TableRow>
              <TableCell
                className="table-cell2"
                align="left"
                sx={{
                  minWidth: "100px",
                }}
              >
                <Typography sx={{
                  fontWeight: "bold",
                  fontFamily: "Lato",
                  fontSize: "1rem",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  padding: "0",
                }}>{filter ?  limitFilterText(filter, 14): "Document Name"}<FilterAltIcon className={filter || open1 ? "filter-icon active" : "filter-icon"} aria-label="filter1"  aria-controls={open1 ? 'filter1' : undefined}
                aria-haspopup="true"
                aria-expanded={open1 ? 'true' : undefined}
                onClick={(e) => handleFilter(e, 1)}/></Typography>
                
              </TableCell>
              <Menu
                sx={{height: "100%"}}
                id="filter1"
                anchorEl={anchorEl1}
                open={open1}
                onClose={(e) => handleFilterClose(e, 1)}
                MenuListProps={{
                  'aria-labelledby': 'filter1',
                }}
              >
                <Box sx={{height: "100%", padding: "2vh"}}>
                  <Autocomplete
                    size="small"
                    defaultValue={filter}
                    id="combo-box-demo"
                    onChange={(e) => setFilter(e.target.innerText == undefined ? "" : e.target.innerText)}
                    options={filteredOptionsName.map((option) => option)}
                    sx={{ width: 300, maxHeight: "100px" }}
                    renderInput={(params) => <TextField onChange={(e) => setFilter(e.target.value == undefined ? "" : e.target.value)} {...params} label="Filter Document Name" />}
                  />
                </Box>
                
              </Menu>
              <TableCell
                className="table-cell2"
                align="left"
                style={{
                  minWidth: "100px",
                  fontWeight: "bold",
                  fontFamily: "Lato",
                  fontSize: "1rem",
                }}
              >
               <Typography sx={{
                  fontWeight: "bold",
                  fontFamily: "Lato",
                  fontSize: "1rem",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  padding: "0"
                }}> {filter8 ?  limitFilterText(filter8, 14): "Document Type"}<FilterAltIcon className={filter8 || open2 ? "filter-icon active" : "filter-icon"} aria-label="filter2" aria-controls={open2 ? 'filter2' : undefined}
                aria-haspopup="true"
                aria-expanded={open2 ? 'true' : undefined}
                onClick={(e) => handleFilter(e,2)}/></Typography>
              </TableCell>
              <Menu
                id="filter2"
                anchorEl={anchorEl2}
                open={open2}
                onClose={(e) => handleFilterClose(e, 2)}
                MenuListProps={{
                  'aria-labelledby': 'filter2',
                }}
              >
                <Box sx={{height: "100%", padding: "2vh"}}>
                  <Autocomplete
                    size="small"
                    defaultValue={filter8}
                    id="combo-box-demo"
                    onChange={(e) => setFilter8(e.target.innerText == undefined ? "" : e.target.innerText)}
                    options={filteredOptionsDocType.map((option) => option)}
                    sx={{ width: 300, maxHeight: "100px" }}
                    renderInput={(params) => <TextField onChange={(e) => setFilter8(e.target.value == undefined ? "" : e.target.value)} {...params} label="Filter Document Type" />}
                  />
                </Box>
              </Menu>

              <TableCell
              className="table-cell2"
                align="left"
                style={{
                  minWidth: "100px",
                  fontWeight: "bold",
                  fontFamily: "Lato",
                  fontSize: "1rem",
                }}
              >
                <Typography sx={{
                  fontWeight: "bold",
                  fontFamily: "Lato",
                  fontSize: "1rem",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  padding: "0"
                }}> {filter2 ?  limitFilterText(filter2, 14): "Received By"}<FilterAltIcon className={filter2|| open3 ? "filter-icon active" : "filter-icon"} aria-label="filter1"  aria-controls={open3 ? 'filter1' : undefined}
                aria-haspopup="true"
                aria-expanded={open3 ? 'true' : undefined}
                onClick={(e) => handleFilter(e, 3)}/></Typography>
              </TableCell>
              <Menu
                id="filter2"
                anchorEl={anchorEl3}
                open={open3}
                onClose={(e) => handleFilterClose(e, 3)}
                MenuListProps={{
                  'aria-labelledby': 'filter2',
                }}
              >
                <Box sx={{height: "100%", padding: "2vh"}}>
                  <Autocomplete
                    size="small"
                    defaultValue={filter2}
                    id="combo-box-demo"
                    onChange={(e) => setFilter2(e.target.innerText == undefined ? "" : e.target.innerText)}
                    options={filteredOptionsReceive.map((option) => option)}
                    sx={{ width: 300, maxHeight: "100px" }}
                    renderInput={(params) => <TextField onChange={(e) => setFilter2(e.target.value == undefined ? "" : e.target.value)} {...params} label="Filter Received By" />}
                  />
                </Box>
              </Menu>

              <TableCell
              className="table-cell2"
                align="left"
                style={{
                  minWidth: "100px",
                  fontWeight: "bold",
                  fontFamily: "Lato",
                  fontSize: "1rem",
                }}
              >
                <Typography sx={{
                  fontWeight: "bold",
                  fontFamily: "Lato",
                  fontSize: "0.95rem",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  padding: "0"
                }}> {filter9 ?  limitFilterText(filter9, 14): "Office/Contact Person"}<FilterAltIcon className={filter9|| open4 ? "filter-icon active" : "filter-icon"} aria-label="filter1"  aria-controls={open4 ? 'filter1' : undefined}
                aria-haspopup="true"
                aria-expanded={open4 ? 'true' : undefined}
                onClick={(e) => handleFilter(e, 4)}/></Typography>
              </TableCell>
              <Menu
                id="filter2"
                anchorEl={anchorEl4}
                open={open4}
                onClose={(e) => handleFilterClose(e, 4)}
                MenuListProps={{
                  'aria-labelledby': 'filter2',
                }}
              >
                <Box sx={{height: "100%", padding: "2vh"}}>
                  <Autocomplete
                    size="small"
                    defaultValue={filter2}
                    id="combo-box-demo"
                    onChange={(e) => setFilter9(e.target.innerText == undefined ? "" : e.target.innerText)}
                    options={filteredOptionsfromDep.map((option) => option)}
                    sx={{ width: 300, maxHeight: "100px" }}
                    renderInput={(params) => <TextField onChange={(e) => setFilter9(e.target.value == undefined ? "" : e.target.value)} {...params} label="Filter Office/Dept" />}
                  />
                </Box>
              </Menu>

              <TableCell
              className="table-cell2"
                align="left"
                style={{
                  minWidth: "100px",
                  fontWeight: "bold",
                  fontFamily: "Lato",
                  fontSize: "1rem",
                }}
              >
                <Typography sx={{
                  fontWeight: "bold",
                  fontFamily: "Lato",
                  fontSize: "1rem",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  padding: "0"
                }}> {filter10 ? dayjs(filter10).format('MM/DD/YYYY').toString() : filter4? "This Year" : filter5? "This Month" :   filter6 ? "This Day" : "Date Received/Sent"}<FilterAltIcon className={filter10|| filter4 || filter5 || filter6 || open5 ? "filter-icon active" : "filter-icon"} aria-label="filter1"  aria-controls={open5 ? 'filter1' : undefined}
                aria-haspopup="true"
                aria-expanded={open5 ? 'true' : undefined}
                onClick={(e) => handleFilter(e, 5)} /></Typography>
              </TableCell>
              <Menu
                id="filter2"
                anchorEl={anchorEl5}
                open={open5}
                onClose={(e) => handleFilterClose(e, 5)}
                MenuListProps={{
                  'aria-labelledby': 'filter2',
                }}
              >
                <Box sx={{height: "100%", padding: "2vh"}}>
                  <Box sx={{display: "flex", flexDirection: "column"}}>
                    <DatePicker format="MM/DD/YYYY" value={dayjs(filter10)} label="Basic date picker" onChange={(e) => setFilter10(e)}/>
                    <Button onClick={(e) => setFilter10("")} sx={{fontSize: "0.9rem", textTransform: "none"}}>Clear date</Button>
                  </Box>
                  <Box sx={{display: "flex", flexDirection: "column"}}>
                    <FormControlLabel control={<Checkbox checked={filter4}  onChange={(e) => setFilter4(!filter4)}/>} label="This Year"/>
                    <FormControlLabel control={<Checkbox checked={filter5}  onChange={(e) => setFilter5(!filter5)}/>} label="This Month"/>
                    <FormControlLabel control={<Checkbox checked={filter6}  onChange={(e) => setFilter6(!filter6)}/>} label="This Day"/>
                  </Box>
                </Box>
              </Menu>

              <TableCell
              className="table-cell2"
                align="left"
                style={{
                  minWidth: "100px",
                  fontWeight: "bold",
                  fontFamily: "Lato",
                  fontSize: "1rem",
                }}
              >
                <Typography sx={{
                  fontWeight: "bold",
                  fontFamily: "Lato",
                  fontSize: "1rem",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  padding: "0"
                }}> {filter3 ? filter3 : "Status"}<FilterAltIcon className={filter3|| open6 ? "filter-icon active" : "filter-icon"} aria-label="filter1"  aria-controls={open6 ? 'filter1' : undefined}
                aria-haspopup="true"
                aria-expanded={open6 ? 'true' : undefined}
                onClick={(e) => handleFilter(e, 6)} /></Typography>
              </TableCell>
              <Menu
                id="filter2"
                anchorEl={anchorEl6}
                open={open6}
                onClose={(e) => handleFilterClose(e, 6)}
                MenuListProps={{
                  'aria-labelledby': 'filter2',
                }}
              >
                <Box sx={{height: "100%", padding: "2vh"}}>
                  <Autocomplete
                    size="small"
                    defaultValue={filter3}
                    id="combo-box-demo"
                    onChange={(e) => setFilter3(e.target.innerText == undefined ? "" : e.target.innerText)}
                    options={filteredOptionsStatus.map((option) => option)}
                    sx={{ width: 300, maxHeight: "100px" }}
                    renderInput={(params) => <TextField onChange={(e) => setFilter3(e.target.value == undefined ? "" : e.target.value)} {...params} label="Filter Status" />}
                  />
                </Box>
              </Menu>

              <TableCell
              className="table-cell2"
                align="left"
                style={{
                  minWidth: "100px",
                  fontWeight: "bold",
                  fontFamily: "Lato",
                  fontSize: "1rem",
                }}
              >
                {" "}
                Action{" "}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ height: "100%"}}>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                const startDate = new Date(row.date_Received);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 30);

                const currentDate = new Date();
                const daysDifference = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
                return(
                <>
                <TableRow hover role="checkbox" tabIndex={-1} key={row.uID} sx={{ cursor: "pointer", userSelect: "none", height: "70px", background: "#F0EFF6",'& :last-child': {borderBottomRightRadius: "10px", borderTopRightRadius: "10px"} ,'& :first-child':  {borderTopLeftRadius: "10px", borderBottomLeftRadius: "10px"} }}>
                  <TableCell className="table-cell" align="left" onClick={() => setOpenRows((prevState => ({...prevState, [row.id]: !prevState[row.id]})))}> {row.document_Name} </TableCell>
                  <TableCell className="table-cell" align="left" onClick={() => setOpenRows((prevState => ({...prevState, [row.id]: !prevState[row.id]})))}> {row.Type == undefined ? row.document_Type : row.Type} </TableCell>
                  <TableCell className="table-cell" align="left" onClick={() => setOpenRows((prevState => ({...prevState, [row.id]: !prevState[row.id]})))}> {row.received_By} </TableCell>
                  <TableCell className="table-cell" align="left" onClick={() => setOpenRows((prevState => ({...prevState, [row.id]: !prevState[row.id]})))}> {row.fromDep == undefined ? row.fromPer : row.fromDep} </TableCell>
                  <TableCell className="table-cell" align="left" onClick={() => setOpenRows((prevState => ({...prevState, [row.id]: !prevState[row.id]})))}> {row.date_Received} </TableCell>
                  <TableCell className="table-cell" align="left" > 
                  {row.Status === 'Completed' ? <span className='table-Done'>Completed</span>: 
                  row.Status === 'Pending' ? <span className='table-Ongoing'>Pending</span>:
                  row.Status === 'Rejected' ? <span className='table-NotDone'>Rejected</span>: <span className='table-Default'>{row.Status}</span>}
                  </TableCell>
          
                  <TableCell className="table-cell" align="left">
                    <Stack spacing={1} direction="row">
                    <Tooltip title={<Typography sx={{fontSize: "0.8rem"}}>View Document</Typography>} arrow>
                      <VisibilityIcon
                        style={{
                          fontSize: "30px",
                          color: "#FFF",
                          cursor: "pointer",
                          background: "#FF6347",
                          borderRadius: "5px",
                        }}
                        className="cursor-pointer"
                        onClick={() => openFile(row.uID)}
                      />
                      </Tooltip>
                      <Tooltip title={<Typography sx={{fontSize: "0.8rem"}}>Edit Document</Typography>} arrow>
                      <EditIcon
                        style={{
                          fontSize: "30px",
                          color: "#FFF",
                          cursor: "pointer",
                          background: "#8181ff",
                          borderRadius: "5px",
                        }}
                        className="cursor-pointer"
                        onClick={() => {
                          editIncoming(
                            row.id,
                            row.date_Received,
                            row.time_Received,
                            row.received_By,
                            row.fromDep,
                            row.fromPer,
                            row.Type,
                            row.Date,
                            row.Status,
                            row.uID,
                            row.Remark,
                            row.Description,
                            row.document_Name,
                            row.document_Type,
                            row.Comment,
                            row.Sched_Date,
                            row.Sched
                          );
                        }}
                      />
                      </Tooltip>
                      <Badge badgeContent={`${daysDifference} days left`} color="error" sx={{zIndex: "11", position:"relative", whiteSpace: 'nowrap'}} invisible={daysDifference > 7 || row.Status == "Pending" ? true : false}>
                      <Tooltip title={<Typography sx={{fontSize: "0.8rem"}}>Archive Document</Typography>} arrow>
                          <ArchiveIcon
                            style={{
                              fontSize: "30px",
                              color: "#FFF",
                              cursor: "pointer",
                              background: "#52E460",
                              borderRadius: "5px",
                              zIndex: "2",
                            }}
                            onClick={() => {
                              deleteIncoming(row.uID, row.document_Name, row.document_Type);
                            }}
                          />
                      </Tooltip>
                      </Badge>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow className="drop-down" sx={{height: "100%", padding: "0", '& :hover': {pointerEvents: "none", cursor: "pointer"}}}>
                  <TableCell colSpan={7} sx={{width: "100%", padding: "0 0 0 0", boxShadow: '0px 15px 10px -13px #E6E4F0', borderBottomLeftRadius: "10px", borderBottomRightRadius: "10px"}}>
                    <Collapse in={openRows[row.id]}>
                      <Box sx={{p: "2vh"}}>
                          <Box sx={{}}>
                              <Typography sx={{fontWeight: "300", fontSize: "0.8rem"}}>Description</Typography>
                              <Typography sx={{fontWeight: "300", fontSize: "1rem",overflow: "hidden", maxWidth: "1000px", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>{row.Description}</Typography>
                          </Box>
                          <Box sx={{mt: "2vh"}}>
                              <Typography sx={{fontWeight: "300", fontSize: "0.8rem"}}>Comment/Note</Typography>
                              <Typography sx={{fontWeight: "300", fontSize: "1rem",overflow: "hidden", maxWidth: "1000px", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>{row.Comment}</Typography>
                          </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
                </>
              )})}
              
          </TableBody>
          
        </Table>
        {loading ? (
                <div className="load-container">
                  <span className="loader"></span>
                </div>
              ) : (
                ""
              )}
              {emptyResult ? (
                <div className="nothing-holder">
                  <img className="noresult" src={noresult} />
                  <div className="nothing">No Documents found</div>
                  <div className="nothing-bottom">
                    Add documents.
                  </div>
                </div>
              ) : (
                ""
              )}
      </TableContainer>
      
      <TablePagination
        className="table-pagination"
        rowsPerPageOptions={[5, 10, 25, 100]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={openAdd} fullWidth maxWidth="md" className="Dialog">
        <DialogTitle className="dialogDisplayTitle">
          <div className="display-title-holder">
            <div className="dialog-title-view">Add Document</div>
            <div className="dialog-title-close">
              <button onClick={handleClose}>Close</button>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="form-body">
          <form action="" ref={form} onSubmit={createIncoming} className="form-style">
            <div className="form-top">
            <Autocomplete
            className="auto-complete"
            onSelect={(e) => setCategoryPick(e.target.value)}
            value={category}
            id="combo-box-demo"
            options={["Student Document", "Faculty Document", "New Hire Document", "IPCR/OPCR", "Travel Order", "Meeting Request"]}
            sx={{ width: "100%"}}
            renderInput={(params) => <TextField value={category} className="auto-complete-text" onChange={(e) => setCategoryPick(e.target.value)} {...params} placeholder="Category"/>}
            />
            {category === "Student Document" ? (
                <>
                <DemoContainer components={['DatePicker', 'TimePicker',]}>
                    <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={newDateReceived} onChange={(e) => setNewDateReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                    <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={newTimeReceived} onChange={(e) => setNewTimeReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                </DemoContainer>
                <FormControl fullWidth className="Select-input">
                  <InputLabel id="demo-simple-select-label">Incoming / Outgoing</InputLabel>
                  <Select
                    className="Select-input-button"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={newIncomingOutgoing}
                    label="Incoming / Outgoing"
                    onChange={(e) => setNewIncomingOutgoing(e.target.value)}
                  >
                    <MenuItem value={"Incoming"}>Incoming</MenuItem>
                    <MenuItem value={"Outgoing"}>Outgoing</MenuItem>
                  </Select>
                </FormControl>
                <TextField required className="Text-input" id="fromPer" label="Document name" variant="outlined" onChange={(e) => setNewDocumentName(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                onChange={(e, newVlaue) => { console.log(newReceivedBy); setNewReceivedBy(newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={newReceivedBy != null && newReceivedBy != undefined ? users.find(item => item.role == (newReceivedBy.slice(newReceivedBy.indexOf("(") + 1, newReceivedBy.indexOf(")")))  && item.full_Name == (newReceivedBy.slice(newReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newReceivedBy} className="auto-complete-text" onChange={(e) => setNewReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                <TextField className="Text-input" id="fromPer" label="Student Name" variant="outlined" onChange={(e) => setNewFromPer(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
  
                value={newType}
                onSelect={(e) => setNewType(e.target.value)}
                id="combo-box-demo"
                options={student}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newType} className="auto-complete-text" onChange={(e) => setNewType(e.target.value)} {...params} placeholder="Document Type" label="Document Type"/>}/>
                <TextField required className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setNewDescription(e.target.value)}/>
                <TextField className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setNewComment(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
  
                value={newStatus ? newStatus : null}
                onSelect={(e) => setNewStatus(e.target.value)}
                id="combo-box-demo"
                options={["Completed","Pending", "Rejected", "Cancelled"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newStatus ? newStatus : null} className="auto-complete-text" onChange={(e) => setNewStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                <Autocomplete
                className="auto-complete"
                onChange={(e, newValue) => {
                  setNewForwardTo(newValue ? newValue.uID : "")
                }}
                value={users.find(item => item.uID == newForwardTo) || null}
                id="combo-box-demo"
                options={users.filter(item => item.uID != user.uID)}
                getOptionLabel={(user) =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField className="auto-complete-text" {...params} placeholder="Forward To" label="Forward To"/>}/>
                
                </>)
                
                : 
                category === "Faculty Document" ? (
                <>
                <DemoContainer components={['DatePicker', 'TimePicker',]}>
                    <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={newDateReceived} onChange={(e) => setNewDateReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                    <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={newTimeReceived} onChange={(e) => setNewTimeReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                </DemoContainer>
                <FormControl fullWidth className="Select-input">
                  <InputLabel id="demo-simple-select-label">Incoming / Outgoing</InputLabel>
                  <Select
                    required
                    className="Select-input-button"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={newIncomingOutgoing}
                    label="Incoming / Outgoing"
                    onChange={(e) => setNewIncomingOutgoing(e.target.value)}
                  >
                    <MenuItem value={"Incoming"}>Incoming</MenuItem>
                    <MenuItem value={"Outgoing"}>Outgoing</MenuItem>
                  </Select>
                </FormControl>
                <TextField required className="Text-input" id="fromPer" label="Document name" variant="outlined" onChange={(e) => setNewDocumentName(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                onChange={(e, newVlaue) => { console.log(newReceivedBy); setNewReceivedBy(newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={newReceivedBy != null && newReceivedBy != undefined ? users.find(item => item.role == (newReceivedBy.slice(newReceivedBy.indexOf("(") + 1, newReceivedBy.indexOf(")")))  && item.full_Name == (newReceivedBy.slice(newReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newReceivedBy} className="auto-complete-text" onChange={(e) => setNewReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                <Autocomplete
                  className="auto-complete"
                  value={newFromDep ? newFromDep : null}
                  onSelect={(e) => setNewFromDep(e.target.value)}
                  id="combo-box-demo"
                  options={office}
                  sx={{ width: "100%"}}
                  renderInput={(params) => <TextField value={newFromDep ? newFromDep : null} className="auto-complete-text" onChange={(e) => setNewFromDep(e.target.value)} {...params} placeholder="Office/Dept" label="Office/Dept"/>}/>
                <TextField className="Text-input" id="fromPer" label="Faculty Name" variant="outlined" onChange={(e) => setNewFromPer(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
  
                value={newType}
                onSelect={(e) => setNewType(e.target.value)}
                id="combo-box-demo"
                options={faculty}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newType} className="auto-complete-text" onChange={(e) => setNewType(e.target.value)} {...params} placeholder="Document Type" label="Document Type"/>}/>
                <TextField required className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setNewDescription(e.target.value)}/>
                <TextField className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setNewComment(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                value={newStatus ? newStatus : null}
                onSelect={(e) => setNewStatus(e.target.value)}
                id="combo-box-demo"
                options={["Completed","Pending", "Rejected", "Cancelled"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newStatus ? newStatus : null} className="auto-complete-text" onChange={(e) => setNewStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                <Autocomplete
                className="auto-complete"
                onChange={(e, newValue) => {
                  setNewForwardTo(newValue ? newValue.uID : "")
                }}
                value={users.find(item => item.uID == newForwardTo) || null}
                id="combo-box-demo"
                options={users.filter(item => item.uID != user.uID)}
                getOptionLabel={(user) =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField className="auto-complete-text" {...params} placeholder="Forward To" label="Forward To"/>}/>
                </>) 
                : 
                category === "New Hire Document" ? (
                <>
                <DemoContainer components={['DatePicker', 'TimePicker',]}>
                    <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={newDateReceived} onChange={(e) => setNewDateReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                    <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={newTimeReceived} onChange={(e) => setNewTimeReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                </DemoContainer>
                <FormControl fullWidth className="Select-input">
                  <InputLabel id="demo-simple-select-label">Incoming / Outgoing</InputLabel>
                  <Select
                    required
                    className="Select-input-button"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={newIncomingOutgoing}
                    label="Incoming / Outgoing"
                    onChange={(e) => setNewIncomingOutgoing(e.target.value)}
                  >
                    <MenuItem value={"Incoming"}>Incoming</MenuItem>
                    <MenuItem value={"Outgoing"}>Outgoing</MenuItem>
                  </Select>
                </FormControl>
                <TextField required className="Text-input" id="fromPer" label="Document name" variant="outlined" onChange={(e) => setNewDocumentName(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                onChange={(e, newVlaue) => { console.log(newReceivedBy); setNewReceivedBy(newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={newReceivedBy != null && newReceivedBy != undefined ? users.find(item => item.role == (newReceivedBy.slice(newReceivedBy.indexOf("(") + 1, newReceivedBy.indexOf(")")))  && item.full_Name == (newReceivedBy.slice(newReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newReceivedBy} className="auto-complete-text" onChange={(e) => setNewReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                <Autocomplete
                  className="auto-complete"
                  value={newFromDep ? newFromDep : null}
                  onSelect={(e) => setNewFromDep(e.target.value)}
                  id="combo-box-demo"
                  options={office}
                  sx={{ width: "100%"}}
                  renderInput={(params) => <TextField value={newFromDep ? newFromDep : null} className="auto-complete-text" onChange={(e) => setNewFromDep(e.target.value)} {...params} placeholder="Office/Dept" label="Office/Dept"/>}/>
                <TextField className="Text-input" id="fromPer" label="Applicant Name" variant="outlined" onChange={(e) => setNewFromPer(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
  
                value={newType}
                onSelect={(e) => setNewType(e.target.value)}
                id="combo-box-demo"
                options={hire}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newType} className="auto-complete-text" onChange={(e) => setNewType(e.target.value)} {...params} placeholder="Document Type" label="Document Type"/>}/>
                <TextField required className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setNewDescription(e.target.value)}/>
                <TextField className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setNewComment(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                value={newStatus ? newStatus : null} 
                onSelect={(e) => setNewStatus(e.target.value)}
                id="combo-box-demo"
                options={["Completed","Pending", "Rejected", "Cancelled"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newStatus ? newStatus : null} className="auto-complete-text" onChange={(e) => setNewStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                <Autocomplete
                className="auto-complete"
                onChange={(e, newValue) => {
                  setNewForwardTo(newValue ? newValue.uID : "")
                }}
                value={users.find(item => item.uID == newForwardTo) || null}
                id="combo-box-demo"
                options={users.filter(item => item.uID != user.uID)}
                getOptionLabel={(user) =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField className="auto-complete-text" {...params} placeholder="Forward To" label="Forward To"/>}/>
                </>) 
                : 
                category === "IPCR/OPCR" ? (
                <>
                <DemoContainer components={['DatePicker', 'TimePicker',]}>
                    <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={newDateReceived} onChange={(e) => setNewDateReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                    <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={newTimeReceived} onChange={(e) => setNewTimeReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                </DemoContainer>
                <FormControl fullWidth className="Select-input">
                  <InputLabel id="demo-simple-select-label">Incoming / Outgoing</InputLabel>
                  <Select
                    className="Select-input-button"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={newIncomingOutgoing}
                    label="Incoming / Outgoing"
                    onChange={(e) => setNewIncomingOutgoing(e.target.value)}
                  >
                    <MenuItem value={"Incoming"}>Incoming</MenuItem>
                    <MenuItem value={"Outgoing"}>Outgoing</MenuItem>
                  </Select>
                </FormControl>
                <TextField required className="Text-input" id="fromPer" label="Document name" variant="outlined" onChange={(e) => setNewDocumentName(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                onChange={(e, newVlaue) => { console.log(newReceivedBy); setNewReceivedBy(newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={newReceivedBy != null && newReceivedBy != undefined ? users.find(item => item.role == (newReceivedBy.slice(newReceivedBy.indexOf("(") + 1, newReceivedBy.indexOf(")")))  && item.full_Name == (newReceivedBy.slice(newReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newReceivedBy} className="auto-complete-text" onChange={(e) => setNewReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                <Autocomplete
                  className="auto-complete"
                  value={newFromDep ? newFromDep : null}
                  onSelect={(e) => setNewFromDep(e.target.value)}
                  id="combo-box-demo"
                  options={office}
                  sx={{ width: "100%"}}
                  renderInput={(params) => <TextField value={newFromDep ? newFromDep : null} className="auto-complete-text" onChange={(e) => setNewFromDep(e.target.value)} {...params} placeholder="Office/Dept" label="Office/Dept"/>}/>
                <TextField className="Text-input" id="fromPer" label="Ratee Name" variant="outlined" onChange={(e) => setNewFromPer(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
  
                value={newType}
                onSelect={(e) => setNewType(e.target.value)}
                id="combo-box-demo"
                options={["IPCR", "OPCR"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newType} className="auto-complete-text" onChange={(e) => setNewType(e.target.value)} {...params} placeholder="Document Type" label="Document Type"/>}/>
                <TextField required className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setNewDescription(e.target.value)}/>
                <TextField className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setNewComment(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                value={newStatus ? newStatus : null}
                onSelect={(e) => setNewStatus(e.target.value)}
                id="combo-box-demo"
                options={["Completed","Pending", "Rejected", "Cancelled"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newStatus ? newStatus : null}className="auto-complete-text" onChange={(e) => setNewStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                <Autocomplete
                className="auto-complete"
                onChange={(e, newValue) => {
                  setNewForwardTo(newValue ? newValue.uID : "")
                }}
                value={users.find(item => item.uID == newForwardTo) || null}
                id="combo-box-demo"
                options={users.filter(item => item.uID != user.uID)}
                getOptionLabel={(user) =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField className="auto-complete-text" {...params} placeholder="Forward To" label="Forward To"/>}/>
                </>)
                :
                category === "Travel Order" ? (
                <>
                <DemoContainer components={['DatePicker', 'TimePicker',]}>
                    <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={newDateReceived} onChange={(e) => setNewDateReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                    <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={newTimeReceived} onChange={(e) => setNewTimeReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                </DemoContainer>
                <FormControl fullWidth className="Select-input">
                  <InputLabel id="demo-simple-select-label">Incoming / Outgoing</InputLabel>
                  <Select
                    className="Select-input-button"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={newIncomingOutgoing}
                    label="Incoming / Outgoing"
                    onChange={(e) => setNewIncomingOutgoing(e.target.value)}
                  >
                    <MenuItem value={"Incoming"}>Incoming</MenuItem>
                    <MenuItem value={"Outgoing"}>Outgoing</MenuItem>
                  </Select>
                </FormControl>
                <TextField required className="Text-input" id="fromPer" label="Document name" variant="outlined" onChange={(e) => setNewDocumentName(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                onChange={(e, newVlaue) => { console.log(newReceivedBy); setNewReceivedBy(newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={newReceivedBy != null && newReceivedBy != undefined ? users.find(item => item.role == (newReceivedBy.slice(newReceivedBy.indexOf("(") + 1, newReceivedBy.indexOf(")")))  && item.full_Name == (newReceivedBy.slice(newReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newReceivedBy} className="auto-complete-text" onChange={(e) => setNewReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                <Autocomplete
                  className="auto-complete"
                  value={newFromDep ? newFromDep : null}
                  onSelect={(e) => setNewFromDep(e.target.value)}
                  id="combo-box-demo"
                  options={office}
                  sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newFromDep ? newFromDep : null} className="auto-complete-text" onChange={(e) => setNewFromDep(e.target.value)} {...params} placeholder="Office/Dept" label="Office/Dept"/>}/>
                <TextField className="Text-input" id="fromPer" label="Contact Person" variant="outlined" onChange={(e) => setNewFromPer(e.target.value)}/>
                <TextField required className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setNewDescription(e.target.value)}/>
                <TextField className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setNewComment(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                value={newStatus ? newStatus : null}
                onSelect={(e) => setNewStatus(e.target.value)}
                id="combo-box-demo"
                options={["Completed","Pending", "Rejected", "Cancelled"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newStatus ? newStatus : null} className="auto-complete-text" onChange={(e) => setNewStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                <Autocomplete
                className="auto-complete"
                onChange={(e, newValue) => {
                  setNewForwardTo(newValue ? newValue.uID : "")
                }}
                value={users.find(item => item.uID == newForwardTo) || null}
                id="combo-box-demo"
                options={users.filter(item => item.uID != user.uID)}
                getOptionLabel={(user) =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField className="auto-complete-text" {...params} placeholder="Forward To" label="Forward To"/>}/>
                </>) 
                : 
                category === "Meeting Request" ? (
                <>
                <DemoContainer components={['DatePicker', 'TimePicker',]}>
                    <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={newDateReceived} onChange={(e) => setNewDateReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                    <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={newTimeReceived} onChange={(e) => setNewTimeReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                </DemoContainer>
                <FormControl fullWidth className="Select-input">
                  <InputLabel id="demo-simple-select-label">Incoming / Outgoing</InputLabel>
                  <Select
                    className="Select-input-button"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={newIncomingOutgoing}
                    label="Incoming / Outgoing"
                    onChange={(e) => setNewIncomingOutgoing(e.target.value)}
                  >
                    <MenuItem value={"Incoming"}>Incoming</MenuItem>
                    <MenuItem value={"Outgoing"}>Outgoing</MenuItem>
                  </Select>
                </FormControl>
                <TextField required className="Text-input" id="fromPer" label="Document name" variant="outlined" onChange={(e) => setNewDocumentName(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                onChange={(e, newVlaue) => { console.log(newReceivedBy); setNewReceivedBy(newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={newReceivedBy != null && newReceivedBy != undefined ? users.find(item => item.role == (newReceivedBy.slice(newReceivedBy.indexOf("(") + 1, newReceivedBy.indexOf(")")))  && item.full_Name == (newReceivedBy.slice(newReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newReceivedBy} className="auto-complete-text" onChange={(e) => setNewReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                <Autocomplete
                className="auto-complete"
                value={newFromDep ? newFromDep : null}
                onSelect={(e) => setNewFromDep(e.target.value)}
                id="combo-box-demo"
                options={office}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newFromDep ? newFromDep : null} className="auto-complete-text" onChange={(e) => setNewFromDep(e.target.value)} {...params} placeholder="Office/Dept" label="Office/Dept"/>}/>
                <TextField className="Text-input" id="fromPer" label="Contact Person" variant="outlined" onChange={(e) => setNewFromPer(e.target.value)}/>
                <TextField required className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setNewDescription(e.target.value)}/>
                <DatePicker required format="MM/DD/YYYY" className="date-pick2" label=" Schedule Date" onChange={(e) => setNewSched_Date(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                <TextField required className="Text-input" id="fromPer" label="Meeting Details" variant="outlined" onChange={(e) => setNewSched(e.target.value)}/>
                <TextField className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setNewComment(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                value={newStatus ? newStatus : null}
                onSelect={(e) => setNewStatus(e.target.value)}
                id="combo-box-demo"
                options={["Completed","Pending", "Rejected", "Cancelled"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newStatus ? newStatus : null} className="auto-complete-text" onChange={(e) => setNewStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                <Autocomplete
                className="auto-complete"
                onChange={(e, newValue) => {
                  setNewForwardTo(newValue ? newValue.uID : "")
                }}
                value={users.find(item => item.uID == newForwardTo) || null}
                id="combo-box-demo"
                options={users.filter(item => item.uID != user.uID)}
                getOptionLabel={(user) =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField className="auto-complete-text" {...params} placeholder="Forward To" label="Forward To"/>}/>
                </>) 
                :
                (
                  <>
                  <DemoContainer components={['DatePicker', 'TimePicker',]}>
                      <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={newDateReceived} onChange={(e) => setNewDateReceived(e)} slotProps={{
                  textField: {
                      required: true,
                  },
                  }}/>
                      <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={newTimeReceived} onChange={(e) => setNewTimeReceived(e)} slotProps={{
                  textField: {
                      required: true,
                  },
                  }}/>
                  </DemoContainer>
                  <FormControl fullWidth className="Select-input">
                  <InputLabel id="demo-simple-select-label">Incoming / Outgoing</InputLabel>
                  <Select
                    className="Select-input-button"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={newIncomingOutgoing}
                    label="Incoming / Outgoing"
                    onChange={(e) => setNewIncomingOutgoing(e.target.value)}
                  >
                    <MenuItem value={"Incoming"}>Incoming</MenuItem>
                    <MenuItem value={"Outgoing"}>Outgoing</MenuItem>
                  </Select>
                </FormControl>
                  <TextField required className="Text-input" id="fromPer" label="Document name" variant="outlined" onChange={(e) => setNewDocumentName(e.target.value)}/>
                  <Autocomplete
                className="auto-complete"
                onChange={(e, newVlaue) => { console.log(newReceivedBy); setNewReceivedBy(newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={newReceivedBy != null && newReceivedBy != undefined ? users.find(item => item.role == (newReceivedBy.slice(newReceivedBy.indexOf("(") + 1, newReceivedBy.indexOf(")")))  && item.full_Name == (newReceivedBy.slice(newReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={newReceivedBy} className="auto-complete-text" onChange={(e) => setNewReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                  <Autocomplete
                  className="auto-complete"
                  value={newFromDep ? newFromDep : null}
                  onSelect={(e) => setNewFromDep(e.target.value)}
                  id="combo-box-demo"
                  options={office}
                  sx={{ width: "100%"}}
                  renderInput={(params) => <TextField value={newFromDep ? newFromDep : null} className="auto-complete-text" onChange={(e) => setNewFromDep(e.target.value)} {...params} placeholder="Office/Dept" label="Office/Dept"/>}/>
                  <TextField className="Text-input" id="fromPer" label="Contact Person" variant="outlined" onChange={(e) => setNewFromPer(e.target.value)}/>
                  <TextField className="Text-input" onChange={(e) => setNewType(e.target.value)}placeholder="Document Type" label="Document Type"/>
                  <TextField required className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setNewDescription(e.target.value)}/>
                  <TextField className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setNewComment(e.target.value)}/>
                  <Autocomplete
                  className="auto-complete"
                  value={newStatus ? newStatus : null}
                  onSelect={(e) => setNewStatus(e.target.value)}
                  id="combo-box-demo"
                  options={["Completed","Pending", "Rejected", "Cancelled"]}
                  sx={{ width: "100%"}}
                  renderInput={(params) => <TextField value={newStatus ? newStatus : null} onChange={(e) => setNewStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                  <Autocomplete
                className="auto-complete"
                onChange={(e, newValue) => {
                  setNewForwardTo(newValue ? newValue.uID : "")
                }}
                value={users.find(item => item.uID == newForwardTo) || null}
                id="combo-box-demo"
                options={users.filter(item => item.uID != user.uID)}
                getOptionLabel={(user) =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField className="auto-complete-text" {...params} placeholder="Forward To" label="Forward To"/>}/>
                  </>) 
            }
            <input style={{display: 'none'}} value={newFromPer} type="text" name="from_name" />
            <input style={{display: 'none'}} value={newDocumentName} type="text" name="document_Name" />
            <input style={{display: 'none'}} value={newComment} type="text" name="user_Comment" />
            <input style={{display: 'none'}} value={user && user.email} type="text" name="user_Email" />
            <input style={{display: 'none'}} value={users.find(item => item.uID == newForwardTo)?.email || null} type="text" name="user_To" />
            </div>
            <div className="right-holder">
              <div className="right-sticky">
                <div className="form-middle">
                  <div className="form-img">

                    {imageDis.length === 0 ? (
                      <div className="no-file">
                      <CloudUploadOutlinedIcon sx={{fontSize: "4rem", color: "#aeaeae"}}/>
                      <Typography sx={{mb: "10px"}}>No File/Files Selected</Typography>
                      <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} sx={{backgroundColor: "#FF6347", textTransform: "none"}}>
                        Upload file/s
                        <VisuallyHiddenInput type="file" accept=".png, .jpeg, .jpg, .pdf, .docx, .xlsx, .xls" capture="environment" multiple onChange={onImageChange} required/>
                      </Button>
                    </div>
                    ): (<>
                    <div className="image-List">
                    {
                      imageDis.map((url) => {
                        return(
                          <Card sx={{ backgroundColor: '#F0EFF6',display: 'flex', maxWidth: windowWidth <= 576 ? "250px" : "350px", alignItems: "center", mb: "1vh", height: "70px", maxHeight: "100px", width: '100%', zIndex: "11"}}>
                            <CardMedia
                                component="img"
                                sx={{width: "100px", height: "70px", maxWidth: "100px", p: "5px",  maxHeight: "100px", objectFit: "contain", display: "flex", justifyContent: "center" }}
                                image={url.image}
                                alt="Profile Picture"
                              />
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <CardContent sx={{width: "100%", maxWidth: "220px", width: "220px" }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between"}}>
                                  <Typography component="div" sx={{width: "150px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>
                                      {url.name}
                                  </Typography>
                                </Box>
                                <Typography variant="subtitle1" component="div" sx={{fontSize: "0.85rem", color: "#999999"}}> 
                                      {url.size}
                                </Typography>
                              </CardContent>
                            </Box>
                          </Card>
                        )
                      })
                    }
                    </div>
                    <div className="bottom-file-buttons">
                      <Button id="file-upload" component="label" variant="contained" startIcon={<CloudUploadIcon />} sx={{backgroundColor: "#FF6347", textTransform: "none"}}>
                        Replace file/s
                        <VisuallyHiddenInput type="file" accept=".png, .jpeg, .jpg, .pdf, .docx, .xlsx, .xls" capture="environment" multiple onChange={onImageChange}/>
                      </Button>
                    </div>
                    </>
                    )}
                    
                  </div>
                <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', bgcolor: "#CA3433", pr: "16px", pl: "16px", borderRadius: "10px", m: "5px", color: "#fff"}}>
                  <FormControlLabel labelPlacement="start" control={<Switch color="warning" onChange={(e) => setUrgent(!urgent)}/>} label={<Typography sx={{fontSize: "0.8rem"}}>Urgent? (An email will be sent to the recipient)</Typography>} />
                </Box>
                </div>
                <div className="form-bottom">
                  <div className="form-submit-cancel">
                    <div className="submit-cancel">
                      <button
                        type="button"
                        className="form-cancel"
                        onClick={handleClose}
                      >
                        Cancel
                      </button>
                      {sumbmit ? (
                        <button disabled={sumbmit} type="submit" className="form-submit2">
                          <div className="load-container3">
                            <span class="loader2"></span>
                          </div>
                        </button>
                      ) : (
                        <button type="submit" className="form-submit">
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={openEdit} fullWidth maxWidth="md" className="Dialog">
        <DialogTitle className="dialogDisplayTitle">
          <div className="display-title-holder">
            <div className="dialog-title-view">Edit Document</div>
            <div className="dialog-title-close">
              <button onClick={handleEditClose}>Close</button>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="form-body">
          <form action="" onSubmit={updateIncoming} className="form-style">
            <div className="form-top">
            {editDocType === "Student Document" ? (
                <>
                <DemoContainer components={['DatePicker', 'TimePicker',]}>
                    <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={editDateReceived} onChange={(e) => setEditDateReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                    <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={editTimeReceived} onChange={(e) => setEditTimeReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                </DemoContainer>
                <TextField required className="Text-input" id="fromPer" value={editDocName} label="Document name" variant="outlined" onChange={(e) => setEditDocName(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
  
                onChange={(e, newVlaue) => { setEditReceivedBy( newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={editReceivedBy != null && editReceivedBy != undefined ? users.find(item => item.role == (editReceivedBy.slice(editReceivedBy.indexOf("(") + 1, editReceivedBy.indexOf(")")))  && item.full_Name == (editReceivedBy.slice(editReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editReceivedBy} className="auto-complete-text" onChange={(e) => setEditReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                <TextField value={editFromPer} className="Text-input" id="fromPer" label="Student Name" variant="outlined" onChange={(e) => setEditFromPer(e.target.value)}/>
                <Autocomplete
                defaultValue={editType}
                className="auto-complete"
  
                onSelect={(e) => setEditType(e.target.value)}
                id="combo-box-demo"
                options={student}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editType} className="auto-complete-text" onChange={(e) => setEditType(e.target.value)} {...params} placeholder="Document Type" label="Document Type"/>}/>
                <TextField required value={editDescription} className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setEditDescription(e.target.value)}/>
                <TextField value={editComment} className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setEditComment(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                defaultValue={editStatus}
  
                onSelect={(e) => setEditStatus(e.target.value)}
                id="combo-box-demo"
                options={["Completed","Pending", "Rejected"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editStatus} className="auto-complete-text" onChange={(e) => setEditStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                </>) : ''
            }
            {editDocType === "Faculty Document" ? (
                <>
                <DemoContainer components={['DatePicker', 'TimePicker',]}>
                    <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={editDateReceived} onChange={(e) => setEditDateReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                    <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={editTimeReceived} onChange={(e) => setEditTimeReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                </DemoContainer>
                <TextField required value={editDocName} className="Text-input" id="fromPer" label="Document name" variant="outlined" onChange={(e) => setEditDocName(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
  
                onChange={(e, newVlaue) => { setEditReceivedBy( newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={editReceivedBy != null && editReceivedBy != undefined ? users.find(item => item.role == (editReceivedBy.slice(editReceivedBy.indexOf("(") + 1, editReceivedBy.indexOf(")")))  && item.full_Name == (editReceivedBy.slice(editReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editReceivedBy} className="auto-complete-text" onChange={(e) => setEditReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                <Autocomplete
                value={editFromDep}
                className="auto-complete"
  
                onSelect={(e) => setEditFromDep(e.target.value)}
                id="combo-box-demo"
                options={office}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editFromDep} className="auto-complete-text" onChange={(e) => setEditFromDep(e.target.value)} {...params} placeholder="Office/Dept" label="Office/Dept"/>}/>
                <TextField value={editFromPer} className="Text-input" id="fromPer" label="Faculty Name" variant="outlined" onChange={(e) => setEditFromPer(e.target.value)}/>
                <Autocomplete
                value={editType}
                className="auto-complete"
  
                onSelect={(e) => setEditType(e.target.value)}
                id="combo-box-demo"
                options={faculty}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editType} className="auto-complete-text" onChange={(e) => setEditType(e.target.value)} {...params} placeholder="Document Type" label="Document Type"/>}/>
                <TextField required value={editDescription} className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setEditDescription(e.target.value)}/>
                <TextField value={editComment} className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setEditComment(e.target.value)}/>
                <Autocomplete
                value={editStatus}
                className="auto-complete"
  
                onSelect={(e) => setEditStatus(e.target.value)}
                id="combo-box-demo"
                options={["Completed","Pending", "Rejected"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editStatus} className="auto-complete-text" onChange={(e) => setEditStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                </>) : ''
            }
            {editDocType === "New Hire Document" ? (
                <>
                <DemoContainer components={['DatePicker', 'TimePicker',]}>
                    <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={editDateReceived} onChange={(e) => setEditDateReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                    <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={editTimeReceived} onChange={(e) => setEditTimeReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                </DemoContainer>
                <TextField required value={editDocName} className="Text-input" id="fromPer" label="Document name" variant="outlined" onChange={(e) => setEditDocName(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
  
                onChange={(e, newVlaue) => { setEditReceivedBy( newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={editReceivedBy != null && editReceivedBy != undefined ? users.find(item => item.role == (editReceivedBy.slice(editReceivedBy.indexOf("(") + 1, editReceivedBy.indexOf(")")))  && item.full_Name == (editReceivedBy.slice(editReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editReceivedBy} className="auto-complete-text" onChange={(e) => setEditReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                <Autocomplete
                value={editFromDep}
                className="auto-complete"
  
                onSelect={(e) => setEditFromDep(e.target.value)}
                id="combo-box-demo"
                options={office}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editFromDep} className="auto-complete-text" onChange={(e) => setEditFromDep(e.target.value)} {...params} placeholder="Office/Dept" label="Office/Dept"/>}/>
                <TextField value={editFromPer} className="Text-input" id="fromPer" label="Applicant Name" variant="outlined" onChange={(e) => setEditFromPer(e.target.value)}/>
                <Autocomplete
                value={editType}
                className="auto-complete"
  
                onSelect={(e) => setEditType(e.target.value)}
                id="combo-box-demo"
                options={hire}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editType} className="auto-complete-text" onChange={(e) => setEditType(e.target.value)} {...params} placeholder="Document Type" label="Document Type"/>}/>
                <TextField required value={editDescription} className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setEditDescription(e.target.value)}/>
                <TextField value={editComment} className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setEditComment(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                value={editStatus}
  
                onSelect={(e) => setEditStatus(e.target.value)}
                id="combo-box-demo"
                options={["Completed","Pending", "Rejected"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editStatus} className="auto-complete-text" onChange={(e) => setEditStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                </>) : ''
            }
            {editDocType === "IPCR/OPCR" ? (
                <>
                <DemoContainer components={['DatePicker', 'TimePicker',]}>
                    <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={editDateReceived} onChange={(e) => setEditDateReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                    <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={editTimeReceived} onChange={(e) => setEditTimeReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                </DemoContainer>
                <TextField required value={editDocName} className="Text-input" id="fromPer" label="Document name" variant="outlined" onChange={(e) => setEditDocName(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
  
                onChange={(e, newVlaue) => { setEditReceivedBy( newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={editReceivedBy != null && editReceivedBy != undefined ? users.find(item => item.role == (editReceivedBy.slice(editReceivedBy.indexOf("(") + 1, editReceivedBy.indexOf(")")))  && item.full_Name == (editReceivedBy.slice(editReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editReceivedBy} className="auto-complete-text" onChange={(e) => setEditReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                <Autocomplete
                value={editFromDep}
                className="auto-complete"
  
                onSelect={(e) => setEditFromDep(e.target.value)}
                id="combo-box-demo"
                options={office}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editFromDep} className="auto-complete-text" onChange={(e) => setEditFromDep(e.target.value)} {...params} placeholder="Office/Dept" label="Office/Dept"/>}/>
                <TextField value={editFromPer} className="Text-input" id="fromPer" label="Ratee Name" variant="outlined" onChange={(e) => setEditFromPer(e.target.value)}/>
                <Autocomplete
                value={editType}
                className="auto-complete"
  
                onSelect={(e) => setEditType(e.target.value)}
                id="combo-box-demo"
                options={["IPCR", "OPCR"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editType} className="auto-complete-text" onChange={(e) => setEditType(e.target.value)} {...params} placeholder="Document Type" label="Document Type"/>}/>
                <TextField required value={editDescription} className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setEditDescription(e.target.value)}/>
                <TextField value={editComment} className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setEditComment(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                value={editStatus}
  
                onSelect={(e) => setEditStatus(e.target.value)}
                id="combo-box-demo"
                options={["Completed","Pending", "Rejected"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editStatus} className="auto-complete-text" onChange={(e) => setEditStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                </>) : ''
            }
            {editDocType === "Travel Order" ? (
                <>
                <DemoContainer components={['DatePicker', 'TimePicker',]}>
                    <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={editDateReceived} onChange={(e) => setEditDateReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                    <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={editTimeReceived} onChange={(e) => setEditTimeReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                </DemoContainer>
                <TextField required value={editDocName} className="Text-input" id="fromPer" label="Document name" variant="outlined" onChange={(e) => setEditDocName(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
  
                onChange={(e, newVlaue) => { setEditReceivedBy( newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={editReceivedBy != null && editReceivedBy != undefined ? users.find(item => item.role == (editReceivedBy.slice(editReceivedBy.indexOf("(") + 1, editReceivedBy.indexOf(")")))  && item.full_Name == (editReceivedBy.slice(editReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editReceivedBy} className="auto-complete-text" onChange={(e) => setEditReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                <TextField value={editFromPer} className="Text-input" id="fromPer" label="Contact Person" variant="outlined" onChange={(e) => setEditFromPer(e.target.value)}/>
                <TextField required value={editDescription} className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setEditDescription(e.target.value)}/>
                <TextField value={editComment} className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setEditComment(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                value={editStatus}
  
                onSelect={(e) => setEditStatus(e.target.value)}
                id="combo-box-demo"
                options={["Completed","Pending", "Rejected"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editStatus} className="auto-complete-text" onChange={(e) => setEditStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                </>) : ''
            }
            {editDocType === "Meeting Request" ? (
                <>
                <DemoContainer components={['DatePicker', 'TimePicker',]}>
                    <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={editDateReceived} onChange={(e) => setEditDateReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                    <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={editTimeReceived} onChange={(e) => setEditTimeReceived(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                </DemoContainer>
                <TextField required value={editDocName} className="Text-input" id="fromPer" label="Document name" variant="outlined" onChange={(e) => setEditDocName(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
  
                onChange={(e, newVlaue) => { setEditReceivedBy( newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={editReceivedBy != null && editReceivedBy != undefined ? users.find(item => item.role == (editReceivedBy.slice(editReceivedBy.indexOf("(") + 1, editReceivedBy.indexOf(")")))  && item.full_Name == (editReceivedBy.slice(editReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editReceivedBy} className="auto-complete-text" onChange={(e) => setEditReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                <Autocomplete
                value={editFromDep}
                className="auto-complete"
  
                onSelect={(e) => setEditFromDep(e.target.value)}
                id="combo-box-demo"
                options={office}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editFromDep} className="auto-complete-text" onChange={(e) => setEditFromDep(e.target.value)} {...params} placeholder="Office/Dept" label="Office/Dept"/>}/>
                <TextField value={editFromPer} className="Text-input" id="fromPer" label="Contact Person" variant="outlined" onChange={(e) => setEditFromPer(e.target.value)}/>
                <TextField required value={editDescription} className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setEditDescription(e.target.value)}/>
                <DatePicker required value={editSched_Date} format="MM/DD/YYYY" className="date-pick2" label=" Schedule Date" onChange={(e) => setEditSched_Date(e)} slotProps={{
                textField: {
                    required: true,
                },
                }}/>
                <TextField required value={editSched} className="Text-input" id="fromPer" label="Meeting Details" variant="outlined" onChange={(e) => setEditSched(e.target.value)}/>
                <TextField value={editComment} className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setEditComment(e.target.value)}/>
                <Autocomplete
                className="auto-complete"
                value={editStatus}
  
                onSelect={(e) => setEditStatus(e.target.value)}
                id="combo-box-demo"
                options={["Completed","Pending", "Rejected"]}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editStatus} className="auto-complete-text" onChange={(e) => setEditStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                </>) 
                : editDocType != "Student Document" && editDocType != "Faculty Document" && editDocType != "New Hire Document" && editDocType != "IPCR/OPCR" && editDocType != "Travel Order" && editDocType != "Meeting Request" ? (
                  <>
                  <DemoContainer components={['DatePicker', 'TimePicker',]}>
                      <DatePicker required format="MM/DD/YYYY" className="date-pick" label="Date Received" value={editDateReceived} onChange={(e) => setEditDateReceived(e)} slotProps={{
                  textField: {
                      required: true,
                  },
                  }}/>
                      <TimePicker required format="hh:mm A" className="date-pick" label="Time Received" value={editTimeReceived} onChange={(e) => setEditTimeReceived(e)} slotProps={{
                  textField: {
                      required: true,
                  },
                  }}/>
                  </DemoContainer>
                  <TextField required className="Text-input" id="fromPer" value={editDocName} label="Document name" variant="outlined" onChange={(e) => setEditDocName(e.target.value)}/>
                  <Autocomplete
                className="auto-complete"
  
                onChange={(e, newVlaue) => { setEditReceivedBy( newVlaue ? `(${newVlaue.role}) - ${newVlaue.full_Name}`: '')}}
                value={editReceivedBy != null && editReceivedBy != undefined ? users.find(item => item.role == (editReceivedBy.slice(editReceivedBy.indexOf("(") + 1, editReceivedBy.indexOf(")")))  && item.full_Name == (editReceivedBy.slice(editReceivedBy.indexOf(")")).replace(") - ", ""))): ''}
                id="combo-box-demo"
                options={users.filter(item => item.role != "Dean" && item.role != "Faculty")}
                getOptionLabel={user =>(user.role != undefined && user.full_Name != undefined) ? `(${user.role}) - ${user.full_Name}` : ''}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editReceivedBy} className="auto-complete-text" onChange={(e) => setEditReceivedBy(e.target.value)} {...params} placeholder="Received By" label="Received By"/>}/>
                  <Autocomplete
                value={editFromDep}
                className="auto-complete"
  
                onSelect={(e) => setEditFromDep(e.target.value)}
                id="combo-box-demo"
                options={office}
                sx={{ width: "100%"}}
                renderInput={(params) => <TextField value={editFromDep} className="auto-complete-text" onChange={(e) => setEditFromDep(e.target.value)} {...params} placeholder="Office/Dept" label="Office/Dept"/>}/>
                  <TextField value={editFromPer} className="Text-input" id="fromPer" label="Contact Person" variant="outlined" onChange={(e) => setEditFromPer(e.target.value)}/>
                  <Autocomplete
                  defaultValue={editType}
                  className="auto-complete"
    
                  onSelect={(e) => setEditType(e.target.value)}
                  id="combo-box-demo"
                  options={student}
                  sx={{ width: "100%"}}
                  renderInput={(params) => <TextField value={editType} className="auto-complete-text" onChange={(e) => setEditType(e.target.value)} {...params} placeholder="Document Type" label="Document Type"/>}/>
                  <TextField required value={editDescription} className="Text-input" id="fromPer" label="Short Description" variant="outlined" onChange={(e) => setEditDescription(e.target.value)}/>
                  <TextField value={editComment} className="Text-input" id="fromPer" label="Comment/Note" variant="outlined" onChange={(e) => setEditComment(e.target.value)}/>
                  <Autocomplete
                  className="auto-complete"
                  defaultValue={editStatus}
    
                  onSelect={(e) => setEditStatus(e.target.value)}
                  id="combo-box-demo"
                  options={["Completed","Pending", "Rejected"]}
                  sx={{ width: "100%"}}
                  renderInput={(params) => <TextField value={editStatus} className="auto-complete-text" onChange={(e) => setEditStatus(e.target.value)} {...params} placeholder="Status" label="Status"/>}/>
                  </>) : ''
            }
            </div>
            <div className="right-holder">
              <div className="right-sticky">
                <div className="form-middle">
                  <div className="form-img">

                    {imageDis.length === 0 ? (
                      <>
                      <div className="image-List">
                      {
                        editImageHolder.map((url) => {
                          return(
                            <Card sx={{ backgroundColor: '#F0EFF6',display: 'flex', maxWidth: windowWidth <= 576 ? "250px" : "350px", alignItems: "center", mb: "1vh", height: "70px", maxHeight: "100px", width: '100%', zIndex: "11"}}>
                              <CardMedia
                                  component="img"
                                  sx={{width: "100px", height: "70px", maxWidth: "100px", p: "5px",  maxHeight: "100px", objectFit: "contain", display: "flex", justifyContent: "center" }}
                                  image={url.image}
                                  alt="Profile Picture"
                                />
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{width: "100%", maxWidth: "220px", width: "220px" }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between"}}>
                                    <Typography component="div" sx={{width: "150px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>
                                        {url.name}
                                    </Typography>
                                  </Box>
                                  <Typography variant="subtitle1" component="div" sx={{fontSize: "0.85rem", color: "#999999"}}> 
                                        {url.size}
                                  </Typography>
                                </CardContent>
                              </Box>
                            </Card>
                          )
                        })
                      }
                      </div>
                      <div className="bottom-file-buttons">
                        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} sx={{backgroundColor: "#FF6347", textTransform: "none"}}>
                          Replace file/s
                          <VisuallyHiddenInput type="file" accept=".png, .jpeg, .jpg, .pdf, .docx, .xlsx, .xls" capture="environment" multiple onChange={onImageChange}/>
                        </Button>
                      </div>
                      </>
                    ): (<>
                    <div className="image-List">
                    {
                      imageDis.map((url) => {
                        return(
                          <Card sx={{ backgroundColor: '#F0EFF6',display: 'flex', maxWidth: windowWidth <= 576 ? "250px" : "350px", alignItems: "center", mb: "1vh", height: "70px", maxHeight: "100px", width: '100%', zIndex: "11"}}>
                            <CardMedia
                                component="img"
                                sx={{width: "100px", height: "70px", maxWidth: "100px", p: "5px",  maxHeight: "100px", objectFit: "contain", display: "flex", justifyContent: "center" }}
                                image={url.image}
                                alt="Profile Picture"
                              />
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <CardContent sx={{width: "100%", maxWidth: "220px", width: "220px" }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between"}}>
                                  <Typography component="div" sx={{width: "150px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>
                                      {url.name}
                                  </Typography>
                                </Box>
                                <Typography variant="subtitle1" component="div" sx={{fontSize: "0.85rem", color: "#999999"}}> 
                                      {url.size}
                                </Typography>
                              </CardContent>
                            </Box>
                          </Card>
                        )
                      })
                    }
                    </div>
                    <div className="bottom-file-buttons">
                      <Button  component="label" variant="contained" startIcon={<CloudUploadIcon />} sx={{backgroundColor: "#FF6347", textTransform: "none"}}>
                        Replace file/s
                        <VisuallyHiddenInput id="file-upload" type="file" accept=".png, .jpeg, .jpg, .pdf, .docx, .xlsx, .xls" capture="environment" multiple onChange={onImageChange}/>
                      </Button>
                    </div>
                    </>
                    )}
                     
                  </div>
                </div>
                
                <div className="form-bottom">
                  <div className="form-submit-cancel">
                    <div className="submit-cancel">
                      <button
                        type="button"
                        className="form-cancel"
                        onClick={handleEditClose}
                      >
                        Cancel
                      </button>
                      {sumbmit ? (
                        <button disabled={sumbmit} type="submit" className="form-submit2">
                          <div className="load-container3">
                            <span class="loader2"></span>
                          </div>
                        </button>
                      ) : (
                        <button type="submit" className="form-submit">
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div style={{ display: "none" }}>
        <ComponentToPrint ref={componentRef} dataFromParent="Others" filtered={filteredData}/>
      </div>

      <Dialog open={openShowFile} fullWidth maxWidth="xl">
        <DialogTitle className="dialogDisplayTitle">
          <div className="display-title-holder">
            <div className="dialog-title-view">View Document</div>
            <div className="dialog-title-close">
              <button onClick={closeFile}>Close</button>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="dialogDisplay">
          {loading2 ? (
            <div className="load-container">
              <span className="loader"></span>
            </div>
          ) : (
            <section className="monitoring2">
              {displayFile.map((displayFile) => {
                return (
                  <div className="view-container">
                    <div className="view-details-container">
                      <div className="view-details">
                        <div className="details">
                          <h2>Document Name: </h2>
                          <p>{displayFile.document_Name}</p>
                        </div>
                        <div className="details">
                          <h2>Category: </h2>
                          <p>{displayFile.document_Type}</p>
                        </div>
                        {displayFile.Type == undefined ? "" : (
                            <div className="details">
                                <h2>Document Type:</h2>
                                <p>{displayFile.Type}</p>
                            </div>
                        )}
                        <div className="details">
                          <h2>Received By: </h2>
                          <p>{displayFile.received_By}</p>
                        </div>
                        <div className="details">
                          <h2>{displayFile.document_Type == "Student Document" ? "Student Name: ": displayFile.document_Type == "Faculty Document" ? "Faculty Name: ":displayFile.document_Type == "New Hire Document" ? "Applicant Name: ":displayFile.document_Type == "IPCR/OPCR" ? "Ratee Name: ": "Contact Person: "} </h2>
                          <p>{displayFile.fromPer}</p>
                        </div>
                        <div className="details">
                          <h2>Date Received: </h2>
                          <p>{displayFile.date_Received + " " + displayFile.time_Received}</p>
                        </div>
                        <div className="details">
                          <h2>Description:</h2>
                          <p>{displayFile.Description}</p>
                        </div>
                        {displayFile.Sched_Date == undefined ? "" : (
                            <div className="details">
                                <h2>Office/Dept:</h2>
                                <p>{displayFile.fromDep}</p>
                            </div>
                        )}
                        {displayFile.Sched_Date == undefined ? "" : (
                            <div className="details">
                                <h2>Schedule Date:</h2>
                                <p>{displayFile.Sched_Date}</p>
                            </div>
                        )}
                        {displayFile.Sched == undefined ? "" : (
                            <div className="details">
                                <h2>Meeting Details:</h2>
                                <p>{displayFile.Sched}</p>
                            </div>
                        )}
                        <div className="details">
                          <h2>Status: </h2>
                          <p>{displayFile.Status}</p>
                        </div>
                        <div className="details">
                          <h2>Comment/Note: </h2>
                          <p>{displayFile.Comment}</p>
                        </div>
                      </div>
                    </div>
                    <div className="view-img">
                      { imageList.length !=0 && filePDF.length != 0 ?(
                        <TabContext value={tabValue}>
                          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                              {imageList.some(item => item.includes(".jpg") || item.includes(".jpeg") || item.includes(".png")) && <Tab sx={{textTransform: "none", fontSize: "1rem"}} label="Image/s" value="1" />}
                              {filePDF.length != 0  && <Tab sx={{textTransform: "none", fontSize: "1rem"}} label="PDF" value="2" />}
                              {fileDocx.length != 0  && <Tab sx={{textTransform: "none", fontSize: "1rem"}} label="Docx" value="3" />}
                              {fileXlsx.length != 0  && <Tab sx={{textTransform: "none", fontSize: "1rem"}} label="Excel" value="4" />}
                            </TabList>
                          </Box>
                          <TabPanel value="1">
                          <Grid container xs={12}>
                          <Button component="label" onClick={(e) => handleDownload("image")} variant="contained" startIcon={<CloudDownload />} sx={{backgroundColor: "#296da9", textTransform: "none", marginBottom: "10px"}}>
                                      Download Image/s
                              </Button>
                              {imageList.some(item => item.includes(".jpg") || item.includes(".jpeg") || item.includes(".png")) &&(
                                    <ImageList variant="masonry" cols={windowWidth <= 375 ? 1 : windowWidth <=576 && windowWidth > 375? 2 : 3} gap={8}>
                                      {imageList.map((url, index) => (
                                            <ImageListItem key={url}>
                                              <img loading="eager" srcSet={`${port}/document_Files/${url}?w=248&fit=crop&auto=format&dpr=2 2x`} src={`${port}/document_Files/${url}?w=248&fit=crop&auto=format`} onClick={(e) => openLightbox(index)}/>
                                            </ImageListItem>                                  
                                      ))}
                                  </ImageList>
                                )}
                            </Grid>
                          </TabPanel>
                          <TabPanel value="2">
                            {
                              filePDF.length != 0 && (
                                <>
                                <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.4.456/build/pdf.worker.js">
                                  {imageList && (
                                    <>
                                      <Viewer fileUrl={`${port}/document_Files/${filePDF}`} defaultScale={1} plugins={[newPlugin, pagePlugin]} theme="dark" />
                                    </>
                                  )}  
                                  {!imageList && <>No PDF</>}
                                </Worker>
                                </>
                              )
                            }
                          </TabPanel>
                          <TabPanel value="3">
                            {
                              fileDocx.length != 0 && (
                                <>
                                <Box sx={{width: "100%", height: '300px', display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                                  <img src={docxViewIcon} style={{width: "150px", height: '150px'}}></img>
                                  <Typography sx={{mt: "5vh"}}>{fileDocx}</Typography>
                                  <Button component="label" onClick={(e) => handleDownload("docx")} variant="contained" startIcon={<CloudDownload />} sx={{backgroundColor: "#296da9", textTransform: "none"}}>
                                    Download .docx File
                                  </Button>
                                </Box>
                                </>
                              )
                            }
                          </TabPanel>
                          <TabPanel value="4">
                            {
                              fileXlsx.length != 0 && (
                                <>
                                <Box sx={{width: "100%", height: '300px', display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                                  <img src={xlsxViewIcon} style={{width: "150px", height: '150px'}}></img>
                                  <Typography sx={{mt: "5vh"}}>{fileXlsx}</Typography>
                                  <Button component="label" onClick={(e) => handleDownload("xlsx")} variant="contained" startIcon={<CloudDownload />} sx={{backgroundColor: "hsl(126, 49%, 36%)", textTransform: "none"}}>
                                    Download .xlsx File
                                  </Button>
                                </Box>
                                </>
                              )
                            }
                          </TabPanel>
                      </TabContext>  
                      )
                      :
                      imageList.some(item => item.includes(".jpg") || item.includes(".jpeg") || item.includes(".png")) ?(
                        <Grid container xs={12}>
                          <Button component="label" onClick={(e) => handleDownload("image")} variant="contained" startIcon={<CloudDownload />} sx={{backgroundColor: "#296da9", textTransform: "none", marginBottom: "10px"}}>
                                      Download Image/s
                              </Button>
                        {imageList.some(item => item.includes(".jpg") || item.includes(".jpeg") || item.includes(".png")) &&(
                              <ImageList variant="masonry" cols={windowWidth <= 375 ? 1 : windowWidth <=576 && windowWidth > 375? 2 : 3} gap={8}>
                                {imageList.map((url, index) => (
                                      <ImageListItem key={url}>
                                        <img loading="eager" srcSet={`${port}/document_Files/${url}?w=248&fit=crop&auto=format&dpr=2 2x`} src={`${port}/document_Files/${url}?w=248&fit=crop&auto=format`} onClick={(e) => openLightbox(index)}/>
                                      </ImageListItem>                                  
                                ))}
                            </ImageList>
                          )}
                      </Grid>
                      ) 
                      :
                      filePDF.length != 0 ? (
                        <>
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.4.456/build/pdf.worker.js">
                          {imageList && (
                            <>
                              <Viewer fileUrl={`${port}/document_Files/${filePDF}`} defaultScale={1} plugins={[newPlugin, pagePlugin]} theme="dark" />
                            </>
                          )}  
                          {!imageList && <>No PDF</>}
                        </Worker>
                        </>
                      )
                      : fileDocx.length !=0 ? (
                          <>
                            <Box sx={{width: "100%", height: '300px', display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                              <img src={docxViewIcon} style={{width: "150px", height: '150px'}}></img>
                              <Typography sx={{mt: "5vh"}}>{fileDocx}</Typography>
                              <Button component="label" onClick={(e) => handleDownload("docx")} variant="contained" startIcon={<CloudDownload />} sx={{backgroundColor: "#296da9", textTransform: "none"}}>
                                Download .docx File
                              </Button>
                            </Box>
                            
                          </> 
                      ) : fileXlsx.length !=0 ? (
                        <>
                          <Box sx={{width: "100%", height: '300px', display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                            <img src={xlsxViewIcon} style={{width: "150px", height: '150px'}}></img>
                            <Typography sx={{mt: "5vh"}}>{fileXlsx}</Typography>
                            <Button component="label" onClick={(e) => handleDownload("xlsx")} variant="contained" startIcon={<CloudDownload />} sx={{backgroundColor: "hsl(126, 49%, 36%)", textTransform: "none"}}>
                              Download .xlsx File
                            </Button>
                          </Box>
                        </> 
                      )
                      :
                      (
                        <div className="load-containerImage">
                          <span className="loader"></span>
                        </div>
                      )}
                      {isLightboxOpen && (
                        <Lightbox
                          mainSrc={`${port}/document_Files/${imageList[lightboxIndex]}`}
                          nextSrc={imageList[(lightboxIndex + 1) % imageList.length]}
                          prevSrc={imageList[(lightboxIndex + imageList.length - 1) % imageList.length]}
                          onCloseRequest={closeLightbox}
                          onMovePrevRequest={() => setLightboxIndex((lightboxIndex + imageList.length - 1) % imageList.length)}
                          onMoveNextRequest={() => setLightboxIndex((lightboxIndex + 1) % imageList.length)}
                          reactModalStyle={{ overlay: { zIndex: 9999 }, content: { zIndex: 9999 } }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={openFilter} fullWidth maxWidth="sm">
        <DialogTitle className="dialogDisplayTitle">
          <div className="display-title-holder">
            <div className="dialog-title-view">Filter</div>
            <div className="dialog-title-close">
              <button onClick={filterClose}>Close</button>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="dialogDisplay">
        <Box sx={{display: "flex", width: "100%", mb: "5vh"}}>
            <Box sx={{width: "100%", padding: "1vh"}}>
                <FormControl variant="outlined" sx={{ marginTop: 1, width: "100%" }}>
                <InputLabel id="DocuType" className="table-filter">Document Type</InputLabel>
                <Select
                labelId="DocuType"
                id="demo-simple-select"
                label="Document Type"
                onChange={(e) => setFilter(e.target.value)}
                className="table-filter"
                value={filter}
                >
                <MenuItem value={""}>Clear Filter</MenuItem>
                {uniqueValuesArray.map((value, index) =>(
                    <MenuItem value={value}>{value}</MenuItem>
                ))}
                </Select>
            </FormControl>
            <TextField label="Description Keyword..." value={filter2} onChange={(e) => setFilter2(e.target.value)} sx={{marginTop: 1}} className="Label-input"/>
            </Box>
            <Box sx={{width: "100%", padding: "1vh"}}>
                <FormControl variant="outlined" sx={{ marginTop: 1, width: "100%" }}>
                <InputLabel id="DocuFrom" className="table-filter">Status</InputLabel>
                <Select
                labelId="DocuFrom"
                id="demo-simple-select"
                label="Status"
                onChange={(e) => setFilter3(e.target.value)}
                className="table-filter"
                value={filter3}
                >
                <MenuItem value={""}>Clear Filter</MenuItem>
                <MenuItem value={"Completed"}><span className='table-Done'>Completed</span></MenuItem>
                <MenuItem value={"Pending"}><span className='table-Ongoing'>Pending</span></MenuItem>
                <MenuItem value={"Rejected"}><span className='table-NotDone'>Rejected</span></MenuItem>
            
                </Select>
            </FormControl>
            <Autocomplete
                className="requests-Forward"
                value={filter7}
  
                id="combo-box-demo"
                onSelect={(e) => setFilter7(e.target.value)}
                options={["Student Document", "Faculty Document", "New Hire Document", "IPCR/OPCR", "Travel Order", "Meeting Request"]}
                sx={{ width: "100%", marginTop: 1 }}
                renderInput={(params) => <TextField value={filter7} onChange={(e) => setFilter7(e.target.value)} {...params} label="Category" />}
                />
            </Box>
        </Box>
          
          
          <FormGroup sx={{padding: "1vh"}}>
            <FormControlLabel className="filter-time" control={<Checkbox checked={filter4}  onChange={(e) => setFilter4((prev) => !prev)}/>} label="This Year" />
            <FormControlLabel className="filter-time" control={<Checkbox checked={filter5}  onChange={(e) => setFilter5((prev) => !prev)}/>} label="This Month" />
            <FormControlLabel className="filter-time" control={<Checkbox checked={filter6}  onChange={(e) => setFilter6((prev) => !prev)}/>} label="This Day" />
          </FormGroup>
        </DialogContent>
      </Dialog>
    </Paper>
    </LocalizationProvider>
  );
}
