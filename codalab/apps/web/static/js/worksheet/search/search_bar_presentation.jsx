import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Search } from 'semantic-ui-react';

// TODO merge search_bar and search_bar_presentation
const ClSearch = styled(Search)`
  z-index:1000;
`;

// TODO do we need to click out of this element? Why all the custom code for it?
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
    // TODO should this be stored in component state?

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
          size={"large"}
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

// TODO write down Redux state for worksheet interface
// which element of worksheet is active?
// what actions?
// What are the props for each of the components
// Let's get rid of the jQuery
