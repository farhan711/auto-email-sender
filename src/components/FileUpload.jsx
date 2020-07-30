import React from 'react'
import PropTypes from 'prop-types'

export function FileUpload({changeHandler}) {
    return <input type="file" name="file" onChange={changeHandler} />
}

FileUpload.propTypes = {
    changeHandler: PropTypes.any
}
