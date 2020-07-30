
import React from 'react'
import PropTypes from 'prop-types'

export function TextArea({placeholder, changeHandler}) {
    return <textarea 
    className="textarea" 
    onChange={e => changeHandler(e.target.value)}
    style={{width: '66.66%', marginTop:30}} 
    placeholder={placeholder}></textarea>

}

TextArea.propTypes = {
    placeholder: PropTypes.any,
    changeHandler: PropTypes.any
} 
