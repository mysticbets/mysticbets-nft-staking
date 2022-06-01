import React from 'react'

function NFTInfo (props) {
	const name = props.mintData.name
	const details = name.split(' ')
	const index = parseInt(details[2].slice(1, details[2].length))
	const url = 'https://opensea.io/assets/0xb9bba653e6f26b09c355d4a4c24894a4ad3dcab7/' + index
 	return (
		<>
		<a href={url} target="_blank">
		<div className="NFTInfo-area">
			<div className="nftinfo-header">
				{/*<span className="watched-num"><i className="fas fa-heart red"></i></span>*/}
			</div>
			<img src={props.mintData.image} className="image-owner" />
			<div className="name-area">
				<span>{props.mintData.name}</span>
			</div>
		</div>
		</a>
		</>
	)
}

export default NFTInfo