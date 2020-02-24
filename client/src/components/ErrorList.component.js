import React, { Component } from 'react';
import { isEmpty, map } from 'lodash';
import FontAwesome from 'react-fontawesome';
import { ListGroup, ListGroupItem } from 'reactstrap';

export class ErrorList extends Component {
	static defaultProps = {
		title: '',
		color: 'danger'
	};

	itemRenderer = (error: Error, index: number) => {
		return (
			<ListGroupItem key={index.toString()} color={this.props.color}>
				<FontAwesome name="exclamation" />
				{error.message}
			</ListGroupItem>
		);
	};

	render() {
		const { errors, title } = this.props;
		if (isEmpty(errors)) {
			return null;
		}

		return (
			<div className="container p-1">
				<ListGroup>
					{title && <h4>{title}</h4>}
					{map(errors, this.itemRenderer)}
				</ListGroup>
			</div>
		);
	}
}
