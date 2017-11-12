import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Search } from 'semantic-ui-react';

const ClSearch = styled(Search)`
  z-index:1000;
`;

class SearchBarPresentation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

		this.setWrapperRef = this.setWrapperRef.bind(this);           
		this.handleClickOutside = this.handleClickOutside.bind(this);
  }

	componentDidMount() {
			document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentWillUnmount() {
			document.removeEventListener('mousedown', this.handleClickOutside);
	}

	/**
	 * Set the wrapper ref
	 */
	setWrapperRef(node) {
			this.wrapperRef = node;
	}

	/**
	 * Alert if clicked on outside of element
	 */
	handleClickOutside(event) {
			if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
        this.setState({
          open: false
        });
			}
	}

  render() {
    let me = this;
    const onResultSelect = (e, selected) => {
      this.props.onResultSelect(e, selected);
      e.preventDefault();
      me.setState({
        open: true
      });
    };

    const onSearchChange = (e, { value }) => {
      this.props.onInputChange(value);
    };

    const stayOpen = this.state.open;

    return (
      <div ref={this.setWrapperRef}>
        <ClSearch
          results={this.props.results}
          loading={this.props.isLoading}
          onSearchChange={onSearchChange}
          onResultSelect={onResultSelect}
          category={this.props.isCategories}
          value={this.props.value}
          open={stayOpen ? stayOpen : undefined}
        />
      </div>
    );
  }
}

SearchBarPresentation.propTypes = {
  results: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        id: PropTypes.string,
      })
    ),
    PropTypes.object,
  ]),
  isCategories: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onResultSelect: PropTypes.func.isRequired,
};

export {
  SearchBarPresentation
};
