import express, { json } from 'express'
import mysql from 'mysql2'
import cors from 'cors'
import fs from 'fs'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import cookieParser from 'cookie-parser'
import nodemailer from 'nodemailer'
import session from 'express-session';
import MySQLStoreCreator from 'express-mysql-session';
import cron from 'node-cron'
import axios from 'axios'

const MySQLStore = MySQLStoreCreator(session);
const app = express()
const port = "http://localhost:3001";
const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"DeansOffice2023",
    database:"dots"
})

db.connect(function(err){
    if(err){
        console.log('DB ERROR');
        throw err;
        return false;
    }
})

const sessionStore = new MySQLStore({
    expiration: (1825 * 86400 * 1000),
    endConnectionOnClose: false
}, db)

app.use(session({
    key: 'SessionToken',
    secret: '192i34k1290wemfij981m239idm',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: (1825 * 86400 * 1000),
        httpOnly: false
    }
}))
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))
app.use(express.json())


//Users
const profileStorage = multer.diskStorage({
    destination: "../profile_Pictures",
    filename: function (req, file, cb) {
        return cb(null, `${req.query.uID}-${file.originalname}`)
    }
})
const uploadProfile = multer({storage: profileStorage})
app.use('/profile_Pictures', express.static('../profile_Pictures'));

app.post("/register", uploadProfile.single('files'), async(req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const registerQ = "INSERT INTO users (`email`, `password`, `full_Name`, `role`, `signInMethod`, `Active`, `uID`, `verified`, `profilePic`, `verification_token`) VALUES (?)"
    const values = [
        req.body.email,
        hashedPassword,
        req.body.full_Name,
        "Faculty",
        "Email",
        1,
        req.query.uID,
        0,
        `${req.query.uID}-${req.body.file_Name}`,
        verificationToken
    ]
    db.query(registerQ, [values], (err, regData) => {
        if (err) return res.json({success : false})
        sendVerificationEmail(req.body.email, verificationToken)
        return res.json({success: true})
    })
    
})

app.post("/registerTemp", async(req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const registerQ = "INSERT INTO users (`email`, `password`, `role`, `signInMethod`, `Active`, `uID`, `verified`, `temporary`) VALUES (?)"
    const values = [
        req.body.email,
        hashedPassword,
        req.body.role,
        "Email",
        1,
        req.body.uID,
        0,
        1
    ]
    db.query(registerQ, [values], (err, regData) => {
        if (err){
            return res.json({success : false})
            return res.status(200).json({success: false})
        }
        return res.status(200).json({success: true})
    })
})

app.post("/completeRegister", uploadProfile.single('files'), async(req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const registerQ = "UPDATE users SET `password` = ?, `full_Name` = ?, `profilePic` = ?, `verification_token` = ?, `temporary` = ? WHERE uID = ?"
    const values = [
        hashedPassword,
        req.body.full_Name,
        `${req.query.uID}-${req.body.file_Name}`,
        verificationToken,
        0
    ]
    db.query(registerQ, [...values, req.query.uID], (err, regData) => {
        if (err) return res.json({success : false})
        // sendVerificationEmail(req.body.email, verificationToken)
        return res.json({success: true})
    })
    
})

async function sendVerificationEmail(email, verificationToken){
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'wp3deansofficetransaction@gmail.com',
            pass: 'ezoc sbde vuui qgqc'
        }
    })

    const verificationLink = `http://localhost:3000/verify/${verificationToken}`;
    const mailOptions = {
        from: 'wp3deansofficetransaction@gmail.com',
        to: email,
        subject: 'Verify Your Email',
        text: 'Email Verification Link',
        html: `Click <a href="${verificationLink}">here</a> to verify your email.`,
    };

    await transporter.sendMail(mailOptions)
}

app.get("/verify", (req, res) =>{
    const q = `SELECT * FROM users WHERE verification_token = '${req.query.token}'`

    db.query(q, (err, data) => {
        if (err) return res.json({success : false})
        const user = data[0]
        if(user){
            const q = "UPDATE users SET `verified` = ?,`verification_token` = ? WHERE uID = ?"
            const values = [
                1,
                null
            ]
    
            db.query(q, [...values, user.uID], (err, data) => {
                if(err) return res.json({success : false});
                return res.json({success: true})
            })
        }
    })
})

app.get("/lookEmail", (req, res) =>{
    const q = `SELECT * FROM users WHERE email = '${req.query.email}'`

    db.query(q, (err, data) => {
        if (err) return res.json({success : false})
        return res.json(data)
    })
})




app.post("/logout", (req, res) => {
    if(req.session.userID){
        req.session.destroy()
        return res.json({ success: true });
    }else{
        return res.json({ success: false });
    }
})

app.post("/login", (req, res) =>{
    const q = `SELECT * FROM users WHERE email = '${req.body.email}' LIMIT 1`
    db.query(q, async(err, data) => {
        if (err) return res.json({success : false})
        if(data.length > 0){
            const passwordMatch = await bcrypt.compare(req.body.password, data[0].password); 
            if (!passwordMatch){
                return res.status(200).json({success : false})
            }else{
                req.session.userID = data[0].uID
                return res.status(200).json(data)
            }
        }
    })
})

app.get("/getUser", async(req, res) => {
    if(req.session.userID){
        let cols = [req.session.userID]
        const q = `SELECT * FROM users WHERE uID = '${cols}' LIMIT 1`
        db.query(q, (err, data) => {
            if (err) return res.json({success : false})
            return res.status(200).json(data)
        })
    }else{
        return res.status(401).json({ success: false });
    }
})


app.get("/getUsers", (req, res) =>{
    const q = `SELECT * FROM users`
    db.query(q, (err, data) => {
        if (err) return res.json({success : false})
        return res.json(data)
    })
})

app.put("/handleDeactivate", (req, res) => {
    if(req.query.action == "deactivate"){
        const q = "UPDATE users SET `Active` = 0 WHERE uID = ?"
        db.query(q, req.query.uID, (err, data) => {
            if(err) return res.json({success : false})
            return res.status(200).json({success : true})
        })
    }
    else if(req.query.action == "activate"){
        const q = "UPDATE users SET `Active` = 1 WHERE uID = ?"
        db.query(q, req.query.uID,(err, data) => {
            if(err) return res.json({success : false})
            return res.status(200).json({success : true})
        })
    }
})

//Documents
const signatureStorage = multer.diskStorage({
    destination: "../signature",
    filename: function (req, file, cb) {
        return cb(null, `${req.query.docID}-${req.query.sigFor}-${file.originalname}`)
    }
})
const uploadSignature = multer({storage: signatureStorage})
app.use('/signature', express.static('../signature'));

app.post("/addSignature", uploadSignature.single("files"),(req, res) => {
    const q = "INSERT INTO signatures (`docID`, `signature_Name`, `signature_For`) VALUES (?)"
    const values = [
        req.query.docID,
        `${req.query.docID}-${req.query.sigFor}-${req.file.originalname}`,
        req.query.sigFor
    ]

    db.query(q, [values], (err, data) => {
        if (err) return res.json({success : false})
        return res.status(200).json({success : true})
    })
})

app.get("/getSignatures", (req, res) => {
    const q = `SELECT * FROM signatures`

    db.query(q, (err, data) => {
        if(err) return res.json({success : false})
        return res.status(200).json(data)
    })
})

app.get("/getDropdowns", (req, res) => {
    const q = `SELECT * FROM dropdowns`
    db.query(q, (err, data) => {
        if (err) return res.json({success : false});
        return res.json(data);
    })
})

app.post("/addDropdowns", (req, res) => {
    const add = "INSERT INTO dropdowns (`option`, `option_For`) VALUES (?)"
    if(req.query.type == "Office"){
        const q = `DELETE FROM dropdowns WHERE option_For = 'Office'`
        db.query(q, (err, data) => {
            if (err) return res.json({success : false});
            for(const drop of req.body.office){
                const values = [
                    drop,
                    "Office"
                ]
                db.query(add, [values],(err, data) => {
                    if (err) return res.json({success : false});
                })
            }
            return res.status(200).json({success : true});
        })
    }
    if(req.query.type == "Categories"){
        const q = `DELETE FROM dropdowns WHERE option_For = 'Categories'`
        db.query(q, (err, data) => {
            if (err) return res.json({success : false});
            for(const drop of req.body.categories){
                const values = [
                    drop,
                    "Categories"
                ]
                db.query(add, [values],(err, data) => {
                    if (err) return res.json({success : false});
                })
            }
            return res.status(200).json({success : true});
        })
    }
    if(req.query.type == "Student"){
        const q = `DELETE FROM dropdowns WHERE option_For = 'Student'`
        db.query(q, (err, data) => {
            if (err) return res.json({success : false});
            for(const drop of req.body.student){
                const values = [
                    drop,
                    "Student"
                ]
                db.query(add, [values],(err, data) => {
                    if (err) return res.json({success : false});
                })
            }
            return res.status(200).json({success : true});
        })
    }
    if(req.query.type == "Faculty"){
        const q = `DELETE FROM dropdowns WHERE option_For = 'Faculty'`
        db.query(q, (err, data) => {
            if (err) return res.json({success : false});
            for(const drop of req.body.faculty){
                const values = [
                    drop,
                    "Faculty"
                ]
                db.query(add, [values],(err, data) => {
                    if (err) return res.json({success : false});
                })
            }
            return res.status(200).json({success : true});
        })
    }
    if(req.query.type == "Hire"){
        const q = `DELETE FROM dropdowns WHERE option_For = 'Hire'`
        db.query(q, (err, data) => {
            if (err) return res.json({success : false});
            for(const drop of req.body.hire){
                const values = [
                    drop,
                    "Hire"
                ]
                db.query(add, [values],(err, data) => {
                    if (err) return res.json({success : false});
                })
            }
            return res.status(200).json({success : true});
        })
    }
})

const templateStorage = multer.diskStorage({
    destination: "../templates",
    filename: function (req, file, cb) {
        return cb(null, `${new Date().getFullYear()}-${file.originalname}`)
    }
})
const uploadTemplate = multer({storage: templateStorage})
app.use('/templates', express.static('../templates'));
app.post("/addTemplate", uploadTemplate.single("files"),(req, res) => {
    const q = "INSERT INTO templates (`name`, `uID`, `file_Name`, `date_Added`, `type`) VALUES (?)"

    const values = [
        req.body.name,
        req.body.uID,
        `${new Date().getFullYear()}-${req.file.originalname}`,
        new Date().toLocaleDateString(),
        req.body.type
    ]

    db.query(q, [values], (err, data) => {
        if (err) return res.json({success : false})
        return res.status(200).json({success : true})
    })
})

app.get("/getTemplates", (req, res) => {
    const q = `SELECT * FROM templates`

    db.query(q, (err, data) => {
        if(err) return res.json({success : false})
        return res.status(200).json(data)
    })
})

app.post("/deleteTemplate",(req, res) => {
    const filesQuery = `SELECT * FROM templates WHERE uID = '${req.query.uID}' LIMIT 1`
    db.query(filesQuery, (err, data) => {
        const filePath = `../templates/${data[0].file_Name}`;
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath)
            const q = `DELETE FROM templates WHERE uID = '${req.query.uID}'`
            db.query(q, (err, data) => {
                if (err) return res.json({success : false})
                return res.status(200).json({success : true})
            })
        }
    })
    
})

app.put("/editProfile", (req, res) => {
    if(req.query.request == "Name"){
        const q = "UPDATE users SET `full_Name` = ? WHERE uID = ?"
        const values = [
            req.body.full_Name
        ]

        db.query(q, [...values, req.query.uID], (err, data) => {
            if(err) return res.json({success : false})
            return res.status(200).json({success : true})
        })
    }
    else if(req.query.request == "Email"){
        const q = `SELECT * FROM users WHERE uID = '${req.query.uID}'`
        db.query(q, async(err, data) => {
            if(err) return res.json({success : false})
            if (data.length > 0) {
                const passwordMatch = await bcrypt.compare(req.body.pass, data[0].password); 
                if (!passwordMatch){
                    return res.status(200).json({success : false})
                }else{
                    const q = "UPDATE users SET `email` = ? WHERE uID = ?"
                    const values = [
                        req.body.email
                    ]
                    db.query(q, [...values, req.query.uID], (err, data) => {
                        if(err) return res.json({success : false})
                        return res.status(200).json({success : true})
                    })
                }
            }
            
        })
    }
    else if(req.query.request == "Password"){
        const q = `SELECT * FROM users WHERE uID = '${req.query.uID}'`
        db.query(q, async(err, data) => {
            if(err) return res.json({success : false})
            if (data.length > 0) {
                const passwordMatch = await bcrypt.compare(req.body.oldPass, data[0].password); 
                if (!passwordMatch){
                    return res.status(200).json({success : false})
                }else{
                    const hashedPassword = await bcrypt.hash(req.body.newPass, 10)
                    const q = "UPDATE users SET `password` = ? WHERE uID = ?"
                    const values = [
                        hashedPassword
                    ]
                    db.query(q, [...values, req.query.uID], (err, data) => {
                        if(err) return res.json({success : false})
                        return res.status(200).json({success : true})
                    })
                }
            }
            
        })
    }
})

app.put("/editProfilePic", uploadProfile.single("files"),(req, res) => {
    const filesQuery = `SELECT * FROM users WHERE uID = '${req.query.uID}' LIMIT 1`
    db.query(filesQuery, (err, data) => {
        const filePath = `../profile_Pictures/${data[0].profilePic}`;
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath)
            const q = "UPDATE users SET `profilePic` = ? WHERE uID = ?"
            const values = [
                `${req.query.uID}-${req.file.originalname}`
            ]

            db.query(q, [...values, req.query.uID], (err, data) => {
                if(err) return res.json({success : false})
                return res.status(200).json({success : true})
            })
        }
    })
    
})



app.post("/createLog", (req, res) => {
    const q = "INSERT INTO logs (`date`, `log`) VALUES (?)"
    const values = [
        req.body.date,
        req.body.log
    ]

    db.query(q, [values], (err, data) => {
        if(err) return res.json({success : false})
        return res.status(200).json({success : true})
    })
})

app.get("/getLogs", (req, res) => {
    const q = `SELECT * FROM logs`

    db.query(q, (err, data) => {
        if(err) return res.json({success : false})
        return res.status(200).json(data)
    })
})



app.get("/documents", (req, res) => {
    let q = null
    if(req.query.type == "Other"){
        q = `SELECT * FROM documents WHERE document_Type NOT IN ('Memorandum', 'Communication') ORDER BY date_Received DESC`
    }else{
        q = `SELECT * FROM documents WHERE Remark = '${req.query.remark}' AND document_Type = '${req.query.type}'ORDER BY date_Received DESC`
    }
    
    db.query(q, (err, data) => {
        if(err) return res.json({success : false})
        return res.json(data)
    })
})
const storage = multer.diskStorage({
    destination: "../document_Files",
    filename: function (req, file, cb) {
        return cb(null, `${req.query.docID}-${file.originalname}`)
    }
})

const upload = multer({storage: storage})
const bytesToSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
app.use('/document_Files', express.static('../document_Files'));
app.post("/documentFiles", upload.array('files'),(req, res) => {
    let queriesExecuted = 0;
    try{
        for(const file of req.files){
            const q = "INSERT INTO files (`file_Name`,`uID`, `size`) VALUES (?)"
            const values = [
                `${req.query.docID}-${file.originalname}`,
                req.body.uID,
                bytesToSize(file.size)
            ]
        
            db.query(q, [values], (err, data) => {
                if(err){
                    return res.json({success : false})
                }else{
                    queriesExecuted++;
                    if(queriesExecuted == req.files.length){
                        return res.json({success: true})
                    }
                }
            })
        }
    }catch(e){
        console.error(e)
    }
})

app.post("/documents",(req, res) => {
    const q = "INSERT INTO documents (`document_Name`,`document_Type`,`date_Received`,`received_By`,`fromPer`,`fromDep`,`time_Received`,`uID`,`Status`,`Type`,`Description`,`Comment`,`forward_To`,`Remark`,`deleted_at`,`urgent`,`unread`, `Sched_Date`, `Sched`, `tracking`) VALUES (?)"
    const values = [
        req.body.document_Name,
        req.body.document_Type,
        req.body.date_Received,
        req.body.received_By,
        req.body.fromPer,
        req.body.fromDep,
        req.body.time_Received,
        req.body.uID,
        req.body.Status,
        req.body.Type,
        req.body.Description,
        req.body.Comment,
        req.body.forward_To,
        req.body.Remark,
        req.body.deleted_at,
        req.body.urgent,
        req.body.unread,
        req.body.Sched_Date,
        req.body.Sched,
        req.body.tracking,
    ]

    db.query(q, [values], (err, data) => {
        
        if(err) return res.json({success : false});
        return res.json({success: true})
    })
})

app.put("/update",(req, res) => {
    const q = "UPDATE documents SET `document_Name` = ?,`date_Received` = ?,`received_By` = ?,`fromPer` = ?,`fromDep` = ?,`time_Received` = ?,`Status` = ?,`Type` = ?,`Description` = ?,`Comment` = ? ,`tracking` = ? WHERE uID = ?"
    const values = [
        req.body.document_Name,
        req.body.date_Received,
        req.body.received_By,
        req.body.fromPer,
        req.body.fromDep,
        req.body.time_Received,
        req.body.Status,
        req.body.Type,
        req.body.Description,
        req.body.Comment,
        req.body.tracking,
    ]

    db.query(q, [...values, req.body.uID], (err, data) => {
        if(err) return res.json({success : false})
        return res.json({success: true})
    })
})

app.put("/updateFile", upload.array('files'),(req, res) => {
    let queriesExecuted = 0;
    const selectQuery = `SELECT * FROM files WHERE uID = '${req.body.uID}'`
        db.query(selectQuery, (err, data) => {
            if (err) return res.json({success : false})
            const fileNames = data.map(item => item.file_Name)
            const deleteQuery = `DELETE FROM files WHERE uID = '${req.body.uID}'`;
            db.query(deleteQuery, (deleteErr, deleteData) => {
                if (deleteErr) {
                    return console.log(deleteErr.message);
                }
            })

            const filesQuery = `SELECT * FROM files`
            db.query(filesQuery, (err, data) => {
                data.forEach(file => {
                    const existingFileNames = data.map(item => item.file_Name)
                    fileNames.forEach(filename => {
                        if(!existingFileNames.includes(filename)){
                            const filePath = `../document_Files/${filename}`;
                            if(fs.existsSync(filePath)){
                                fs.unlinkSync(filePath)
                            }
                        }
                    });  
                })
            })
                  
            try{
                for(const file of req.files){
                    const insertQuery = "INSERT INTO files (`file_Name`, `uID`, `size`) VALUES (?)";
                    const values = [
                        `${req.query.docID}-${file.originalname}`,
                        req.body.uID,
                        bytesToSize(file.size),
                    ]
                
                    db.query(insertQuery, [values], (err, data) => {
                        if(err){
                            return res.json({success : false})
                        }else{
                            queriesExecuted++;
                            if(queriesExecuted == req.files.length){
                                return res.json({success: true})
                            }
                        }
                    })
                }
            }catch(e){
                console.error(e)
            }
        })
    
})



app.get("/getArchives",(req, res) => {
    const q = `SELECT * FROM archives`;
    db.query(q, (err, data) => {
      if (err) return res.json({success : false});
      return res.json(data);
    });
});

app.get("/getFilteredArchives",(req, res) => {
    const q = `SELECT * FROM archives WHERE document_Type = '${req.query.documentType}' AND SUBSTRING(date_Received, 7, 4) = '${req.query.year}';`;
    db.query(q, (err, data) => {
      if (err) return res.json({success : false});
      return res.json(data);
    });
});

app.post("/archiveFile",(req, res) => {
    const selectQuery = `SELECT * FROM documents WHERE uID = '${req.query.id}'`;
    const deleteQuery = `DELETE FROM documents WHERE uID = '${req.query.id}'`;
    const insertQuery = "INSERT INTO archives (`document_Name`,`document_Type`,`date_Received`,`received_By`,`fromPer`,`fromDep`,`time_Received`,`uID`,`Status`,`Type`,`Description`,`Comment`,`forward_To`,`Remark`,`deleted_at`,`urgent`,`unread`, `archived_By`, `tracking`) VALUES (?)"
    db.query(selectQuery, (err, data) => {
      if (err) return res.json({success : false});
        const selectedData = data[0]
        const values = [
            selectedData.document_Name,
            selectedData.document_Type,
            selectedData.date_Received,
            selectedData.received_By,
            selectedData.fromPer,
            selectedData.fromDep,
            selectedData.time_Received,
            selectedData.uID,
            selectedData.Status,
            selectedData.Type,
            selectedData.Description,
            selectedData.Comment,
            selectedData.forward_To,
            selectedData.Remark,
            selectedData.deleted_at,
            selectedData.urgent,
            selectedData.unread,
            req.query.user,
            selectedData.tracking
        ]
        db.query(insertQuery, [values], (err, insertData) => {
            if (err) return res.json({success : false})
            db.query(deleteQuery, (err, delData) => {
                if (err)  return res.json({success : false});
                return res.json({success: true})
            })
        })
    });
});

app.get("/openFile",(req, res) => {
    const q = `SELECT * FROM documents WHERE uID = '${req.query.id}'`;
    db.query(q, (err, data) => {
      if (err) return res.json({success : false});
      return res.json(data);
    });
});

app.get("/getFile",(req, res) => {
    const q = `SELECT * FROM files WHERE uID = '${req.query.id}'`;
    db.query(q, (err, data) => {
      if (err) return res.json({success : false});
      return res.json(data);
    });
});

app.get("/openArchiveFile",(req, res) => {
    const q = `SELECT * FROM archives WHERE uID = '${req.query.id}'`;
    db.query(q, (err, data) => {
      if (err) return res.json({success : false});
      return res.json(data);
    });
});

app.get("/getArchiveFiles",(req, res) => {
    const q = `SELECT * FROM files`;
    db.query(q, (err, data) => {
      if (err) return res.json({success : false});
      return res.json(data);
    });
});


app.get("/getPending", (req, res) => {
    const q = `SELECT * FROM documents WHERE Status = 'Pending' AND forward_To ='${req.query.userID}'`
    db.query(q, (err, data) => {
        if (err) return res.json({success : false});
        return res.json(data);
    })
})

app.get("/getApproved", (req, res) => {
    const q = `SELECT * FROM documents WHERE Status = 'Completed'`
    db.query(q, (err, data) => {
        if (err) return res.json({success : false});
        const sentData = data.filter(item => item.forward_To == req.query.userID || ((item.forward_To.includes(req.query.role) || item.forward_To.includes("All")) && !item.forward_To.includes(req.query.userID)))
        return res.json(sentData);
    })
})

app.get("/getRejected", (req, res) => {
    const q = `SELECT * FROM documents WHERE Status = 'Rejected'`
    db.query(q, (err, data) => {
        if (err) return res.json({success : false});
        const sentData = data.filter(item => item.forward_To == req.query.userID || ((item.forward_To.includes(req.query.role) || item.forward_To.includes("All")) && !item.forward_To.includes(req.query.userID)))
        return res.json(sentData);
    })
})

app.get("/getRequests", (req, res) => {
    const q = `SELECT * FROM documents`
    db.query(q, (err, data) => {
        if (err) return res.json({success : false});
        return res.json(data);
    })
})

app.get("/getNotifs", (req, res) => {
    const q = `SELECT * FROM notifications WHERE userUID = '${req.query.userID}'`
    db.query(q, (err, data) => {
        if (err) return res.json({success : false});
        return res.json(data);
        
    })
})

app.get("/requests", (req, res) => {
    const q = `SELECT * FROM documents`
    db.query(q, (err, data) => {
        if (err) return res.json({success : false});
        return res.json(data);
    })
})

app.put("/unread",(req, res) => {
    const q = "UPDATE documents SET `unread` = ? WHERE uID = ?"
    const values = [
        req.body.unread,
    ]

    db.query(q, [...values, req.body.uID], (err, data) => {
        if(err) return res.json({success : false});
        return res.json({success: true})
    })
})

app.put("/updateNotif",(req, res) => {
    const q = `DELETE FROM notifications WHERE docID = '${req.body.docID}' AND userUID = '${req.body.userUID}'`
    db.query(q, (err, data) => {
        if(err) return res.json({success : false});
        return res.json({success: true})
    })
})

app.put("/approveReject",(req, res) => {
    const q = "UPDATE documents SET `forward_To` = ?, `Comment` = ?, `forwarded_By` = ?, `forwarded_DateTime` = ?, `accepted_Rejected_In` = ?, `accepted_Rejected_By` = ? , `Status` = ? , `urgent` = ?  WHERE uID = ?"
    const values = [
        req.body.forward_To,
        req.body.Comment,
        req.body.forwarded_By,
        req.body.forwarded_DateTime,
        req.body.accepted_Rejected_In,
        req.body.accepted_Rejected_By,
        req.body.Status,
        0
    ]
    db.query(q, [...values, req.body.uID], (err, data) => {
        if(err) return res.json({success : false})
        return res.json({success: true})
    })
})

app.put("/forwardRequest",(req, res) => {
    const q = "UPDATE documents SET `forward_To` = ?, `Comment` = ?, `forwarded_By` = ?, `forwarded_DateTime` = ?, `accepted_Rejected_In` = ?, `accepted_Rejected_By` = ?  WHERE uID = ?"
    const values = [
        req.body.forward_To,
        req.body.Comment,
        req.body.forwarded_By,
        req.body.forwarded_DateTime,
        req.body.accepted_Rejected_In,
        req.body.accepted_Rejected_By,
    ]
    db.query(q, [...values, req.body.uID], (err, data) => {
        if(err) return res.json({success : false})
        return res.json({success: true})
    })
})

app.post("/notif",(req, res) => {
    const selectQuery = `SELECT * FROM notifications WHERE userUID = '${req.body.userUID}' AND docID = '${req.body.docId}'`
    db.query(selectQuery, (err, data) => {
        if (err) return res.json({success : false});
        if (data.length > 0){
            const deleteQuery = `DELETE FROM notifications WHERE userUID = '${req.body.userUID}' AND docID = '${req.body.docId}'`
            db.query(deleteQuery, (err, deleteData) =>{
                if (err) return res.json({success : false})
            })
        }
        let reminder = 0
        if(req.query.reminder == "remind"){
            reminder = 1
        }
        const q = "INSERT INTO notifications (`docID`,`userUID`,`isRead`,`multiple`, `reminder`) VALUES (?)"
        const values = [
            req.body.docId,
            req.body.userUID,
            req.body.isRead,
            req.body.multiple,
            reminder
        ]
        db.query(q, [values], (err, postData) => {   
            if(err) return res.json({success : false})
            return res.json({success: true})
        })
    })
   
})

cron.schedule('0 0 * * *', async() => {
    try{
        const snapshot = await axios.get(`${port}/getRequests`);
        snapshot.data.forEach(async(docSnap) => {
            const dateReceived = new Date(docSnap.date_Received)
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            if (dateReceived <= thirtyDaysAgo) {
                if(docSnap.Status != "Pending"){
                    try{
                        await axios.post(`${port}/archiveFile?id=${docSnap.uID}&user=System`)
                    }catch(e){
                        console.log(e.message);
                    }
                }
            }
        });
    }catch(e){
        console.log(e.message);
    }
})

cron.schedule('0 0 * * *', async() => {
    try{
        const snapshot = await axios.get(`${port}/getRequests`);
        const users = await axios.get(`${port}/getUsers`);
        const userList = users.data
        for(const docSnap of snapshot.data){
            const dateReceived = new Date(docSnap.date_Received)
            const today = new Date();
            const threeDaysAgo = new Date(today);
            threeDaysAgo.setDate(today.getDate() - 3);
            const timeDifference = today - dateReceived;
            const daysPending = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            if (dateReceived <= threeDaysAgo) {
                if(docSnap.Status == "Pending"){
                    console.log("pending");
                    const values = {
                        docId : docSnap.uID,
                        userUID : docSnap.forward_To,
                        isRead : 0,
                        multiple : 0,
                    }
                    axios.post(`${port}/notif?reminder=remind`, values)
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'wp3deansofficetransaction@gmail.com',
                            pass: 'ezoc sbde vuui qgqc'
                        }
                    })
                
                    const verificationLink = `http://localhost:3000/Pages/PendingLetters`;
                    const mailOptions = {
                        from: 'wp3deansofficetransaction@gmail.com',
                        to: userList.find(user => user.uID == docSnap.forward_To)?.email,
                        subject: 'Pending Document',
                        html: `A ${docSnap.document_Type} document (${docSnap.document_Name}) from ${docSnap.fromPer} has been pending for the last ${daysPending} days. Click <a href="${verificationLink}">here</a> to view the document`,
                    };
                
                    await transporter.sendMail(mailOptions)
                    
                }
            }
        };
    }catch(e){
        console.log(e.message);
    }
})


app.listen(3001, () => { 
    
})
