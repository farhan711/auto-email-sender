import React from 'react'
import PropTypes from 'prop-types'


export function Input({type, placeholder, changeHandler}) {
    return <input 
    className="input is-primary" 
    type={type} 
    onChange={e => changeHandler(e.target.value)}
    style={{width: '33.33%'}} 
    placeholder={placeholder}></input>
}

Input.propTypes = {
    type: PropTypes.string,
    placeholder: PropTypes.string,
    changeHandler: PropTypes.any
}
