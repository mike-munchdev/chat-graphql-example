import React, { Fragment } from 'react';
import { Button } from 'reactstrap';

const handleUpdateFilters = (filter, filters, onUpdateFilters) => {
	const newFilterObject = { ...filters, ...filter };
	onUpdateFilters(newFilterObject);
};

export const ChannelFilter = ({ filters, onUpdateFilters }) => {
	return (
		<Fragment>
			<div
				className="btn-group btn-group-sm chat_button_group"
				role="group"
				aria-label="Basic example"
			>
				<Button
					color={filters.assigned === 'my' ? 'primary' : 'secondary'}
					className={
						filters.assigned === 'my'
							? 'chat_split_button_active'
							: 'chat_split_button_inactive'
					}
					onClick={e => {
						handleUpdateFilters(
							{ assigned: 'my' },
							filters,
							onUpdateFilters
						);
					}}
				>
					My Chats
				</Button>
				<Button
					color={filters.assigned === 'un' ? 'primary' : 'secondary'}
					className={
						filters.assigned === 'un'
							? 'chat_split_button_active'
							: 'chat_split_button_inactive'
					}
					onClick={e => {
						handleUpdateFilters(
							{ assigned: 'un' },
							filters,
							onUpdateFilters
						);
					}}
				>
					Unassigned
				</Button>
			</div>
			<div
				className="btn-group btn-group-sm chat_button_group"
				role="group"
			>
				<Button
					color={filters.status === 'open' ? 'primary' : 'secondary'}
					className={
						filters.status === 'open'
							? 'chat_split_button_active'
							: 'chat_split_button_inactive'
					}
					onClick={e => {
						handleUpdateFilters(
							{ status: 'open' },
							filters,
							onUpdateFilters
						);
					}}
				>
					Open
				</Button>
				<Button
					color={
						filters.status === 'closed' ? 'primary' : 'secondary'
					}
					className={
						filters.status === 'closed'
							? 'chat_split_button_active'
							: 'chat_split_button_inactive'
					}
					onClick={e => {
						handleUpdateFilters(
							{ status: 'closed' },
							filters,
							onUpdateFilters
						);
					}}
				>
					Closed
				</Button>
				<Button
					color={
						filters.status === 'flagged' ? 'primary' : 'secondary'
					}
					className={
						filters.status === 'flagged'
							? 'chat_split_button_active'
							: 'chat_split_button_inactive'
					}
					onClick={e => {
						handleUpdateFilters(
							{ status: 'flagged' },
							filters,
							onUpdateFilters
						);
					}}
				>
					Flagged
				</Button>
			</div>
		</Fragment>
	);
};
