import React,{useState} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import Divider from '@material-ui/core/Divider'
import { IconButton } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginBottom: theme.spacing(3),
        borderRadius: '10px',
        backgroundColor: theme.palette.type === 'dark' ? 'black' : 'white',
    },
    input: {
        padding: theme.spacing(1, 2),
        fontSize: '18px',
        flex: 1,
    },
    iconButton: {
        padding: '8px 12px',
        fontSize: '18px',
        color: 'black',
        backgroundColor:'#93298b',
        // color: '#31c77e',
    },
    divider: {
        height: 40,
        margin: 4,
        backgroundColor: 'grey',
    },
}));

const TextField = ({value, setValue, maxValue}) => {
    const classes = useStyles();

    const handleChange = (event) => {
        if(isNaN(parseFloat(event.target.value))) {
            setValue(0)
        }
        else if(parseFloat(event.target.value) === 0 && parseFloat(value) === 0) {
            setValue('0')
        }
        else if(parseFloat(event.target.value) < 0) {
            setValue(0)
        }
        else if(parseFloat(event.target.value) <= parseFloat(maxValue)) {
            setValue(parseFloat(event.target.value).toString())
        }
        else if(parseFloat(event.target.value) > parseFloat(maxValue)) {
            setValue(parseFloat(maxValue))
        }
    }

    const handleMax = () => {
        setValue(maxValue)        
    }

    return (
        <Paper className={classes.root}>
            <InputBase
                className={classes.input}
                value={value}
                onChange={handleChange}
                name="numberformat"
                id="formatted-numberformat-input"
                type="number"
            />
            <Divider className={classes.divider} orientation="vertical" />
            <IconButton className={classes.iconButton} aria-label="directions" onClick={handleMax}>
                Max
            </IconButton>
        </Paper>
    );
}

export default TextField;

