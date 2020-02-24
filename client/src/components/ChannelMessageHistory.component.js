import React, { Fragment } from 'react';

import moment from 'moment';

class ChannelMessageHistory extends React.Component {
	state = {
		popoverOpen: false,
		messages: [],
		messagesEndRef: {}
	};
	unsubscribe = null;

	componentDidMount() {
		if (this.props.messagesForChannel) {
			this.setState({
				messages: this.props.messagesForChannel.messages || []
			});
		}
		this.unsubscribe = this.props.subscribeToNewMessages();
	}
	componentWillUnmount() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.messagesForChannel) {
			this.setState({
				messages: nextProps.messagesForChannel.messages
			});
		}

		if (nextProps.messagesEndRef) {
			this.setState({
				messagesEndRef: nextProps.messagesEndRef
			});
		}
	}
	componentDidUpdate() {
		if (this.props.scrollToBottom) {
			this.props.scrollToBottom();
		}
	}
	displayMessageDate = date => {
		const today = moment();
		const dateToMoment = moment(date);
		return `${dateToMoment.format('LT')} | ${
			today.isSame(dateToMoment, 'day')
				? 'Today'
				: dateToMoment.format('MMM DD')
		}`;
	};
	displayMessage = (msg, user) => {
		if (user.id === msg.user.id) {
			return (
				<div className="outgoing_msg" key={msg.id}>
					<div className="open" />
					<div className="sent_msg">
						<div className="msg_text">{msg.text}</div>
						<div className="msg_time_date">
							{this.displayMessageDate(msg.dateSent)}
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="incoming_msg" key={msg.id}>
					<div className="incoming_msg_initials_box">{`${msg.user.firstName
						.slice(0, 1)
						.toUpperCase()}${msg.user.lastName
						.slice(0, 1)
						.toUpperCase()}`}</div>
					<div className="received_msg">
						<div className="msg_text">{msg.text}</div>
						<div className="msg_time_date">
							{this.displayMessageDate(msg.dateSent)}
						</div>
					</div>
					<div className="open" />
				</div>
			);
		}
	};

	render() {
		const { user, messagesEndRef } = this.props;
		return (
			<Fragment>
				<div
					style={{ float: 'left', clear: 'both' }}
					ref={messagesEndRef}
				/>
				{this.state.messages.map(m => this.displayMessage(m, user))}
			</Fragment>
		);
	}
}

export default ChannelMessageHistory;
