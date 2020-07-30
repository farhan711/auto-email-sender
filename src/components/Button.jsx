import React from 'react'
import PropTypes from 'prop-types'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
    button: {
        margin: {
            top: 10,
            bottom: 10
        }
    }
})

export function Button({ name, disabled = false, onClick, loading }) {
    const classes = useStyles() 
    return <button className={`${classes.button} ${loading? "is-loading" : ""} button is-primary`} disabled={disabled} onClick={onClick}>{name}</button>
}

Button.propTypes = {
    name: PropTypes.string,
    disabled: PropTypes.any,
    onClick: PropTypes.any,
    loading: PropTypes.bool
}
