import React, { useState } from 'react';
import DatePicker from "react-datepicker";

import './App.css';
import { Button } from './components/Button'
import { Input } from './components/Input';
import { FileUpload } from './components/FileUpload'
import { TextArea } from './components/TextArea';
import { scheduleEmail, sendEmail, uploadFile } from './api/functions'

import "react-datepicker/dist/react-datepicker.css";

function App() {

  const [file, setFile] = useState()
  const [isUploading, setIsUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [date, setDate] = useState(new Date())

  return (
    <div className="App">
      <header className="App-header">
        <p style={{ marginBottom: 15 }}>Upload a file then Email it as an attachment to users</p>
        <div>
          <FileUpload changeHandler={e => setFile(e.target.files[0])} />
        </div>
        <Button loading={isUploading} name="Upload File" disabled={!file || isUploading || isUploaded} onClick={() => uploadFile(file, setIsUploading, setIsUploaded)} />
        <Input type="text" placeholder="Add comma seperated Email Addresses" changeHandler={setTo} />
        <Input type="text" placeholder="Subject" changeHandler={setSubject} />
        <div className="columns is-12">
          <TextArea placeholder="Body" changeHandler={setMessage} />
        </div>
        <Button name="Send File Now" disabled={!isUploaded} onClick={() => sendEmail(file, subject, message, to)} />
        <div className="columns is-vcentered">
          <div className="column">
            <Button name="Schedule Send" disabled={!isUploaded} onClick={() => scheduleEmail(file, subject, message, to, date)} />
          </div>
          <div className="column">
            <DatePicker
              selected={date}
              onChange={date => setDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={5}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
          </div>
        </div>


      </header>
    </div>
  );
}

export default App;
