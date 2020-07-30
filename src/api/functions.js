import { API } from 'aws-amplify'
import axios from 'axios'

export const sendEmail = async (file, subject, message, to) => {
    const toAddressess = to.split(",")
    const body = {
        subject,
        message,
        key: file.name,
        to: toAddressess
    }
    const resp = await API.post('emailApi', '/send-email', { body })
    console.log('Resp', resp)
    alert('Email Sent!')
}

export const scheduleEmail = async (file, subject, message, to, sendAt) => {
    const toAddressess = to.split(",")
    const body = {
        subject,
        message,
        to: toAddressess,
        key: file.name,
        sendAt: new Date(sendAt).getTime()
    }
    const resp = await API.post('emailApi', '/schedule-email', { body })
    console.log('Resp', resp)
    alert('Email Scheduled!')
}


export const uploadFile = async (file, setIsUploading, setIsUploaded) => {
    if (!file) return
    setIsUploading(true)
    const body = {
        name: file.name,
        fileType: file.type
    }
    try {
        const resp = await API.post('emailApi', '/preSignedURL', { body })
        const s3Upload = await axios.put(resp.signedUrl, file, { headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' } })
        console.log('S3 Upload', s3Upload)
        setIsUploaded(true)
        setIsUploading(false)
        alert('File Uploaded')
    } catch (error) {
        console.log('Error', error)
        setIsUploading(false)
        alert('Error Uploading File')
    }
    
}
