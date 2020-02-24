import { Component } from 'react';
import moment from 'moment';

export class FormPage extends Component {
	state = {
		page: 1,
		entriesPerPage: 15,
		eppDropdownOpen: false,
		redirect: false,
		redirectTo: ''
	};

	handleChange = event => {
		const target = event.target;
		const value =
			target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;

		this.setState({ [name]: value });
	};

	populateTodaysDate = key => () => {
		const today = moment().format('YYYY-MM-DD');
		console.log(key);
		this.setState({ [key]: today });
	};
}
