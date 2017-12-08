import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Search } from 'semantic-ui-react';
import mouseTrap from 'react-mousetrap';
import update from 'immutability-helper';
import { clFetch } from '../utils.jsx';

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentQuery: "",
      bundles: {},
      worksheets: {},
    };

    this.onResultSelect = this.onResultSelect.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  componentDidMount() {
    this.onInputChange('max');
  }

  onInputChange(inputText) {
    const self = this;

    this.setState(update(this.state, {
      currentQuery: {
        $set: inputText,
      }
    }));

    // TODO add docs
    function convertInputToKeywordQueryString(input) {
      let keywordsQuery;
      // remove leading / trailing whitespace, split
      // by any whitespace
      keywordsQuery = input.trim().split(/[ ]+/);
      keywordsQuery.push(".limit=5");
      let keywordsQueryString = keywordsQuery.reduce((accumulated, cur) => {
        return accumulated + `keywords=${encodeURIComponent(cur)}` + '&';
      }, '');
      return keywordsQueryString;
    }

    let keywordQueryString = convertInputToKeywordQueryString(inputText);

    clFetch({
      url: `/rest/bundles?${keywordQueryString}`,
      setState: (updater, callback) => self.setState(updater, callback),
      key: ['worksheets', inputText],
      context: { inputText },
      onReady: () => console.log(self.state)
    });

    clFetch({
      url: `/rest/worksheets?${keywordQueryString}`,
      setState: (updater, callback) => self.setState(updater, callback),
      key: ['bundles', inputText],
      context: { inputText },
      onReady: () => console.log(self.state)
    });
  }

  /**
   * e : SyntheticEvent : React synthetic event object.
   * selected : JSON : the JSON represention of the selected result
   */
  onResultSelect(e, selected) {
    const type = select.result.type;

    switch (type) {
      case 'worksheet':
        window.location.href = `/worksheets/${selected.result.id}`;
        break;
      case 'bundle':
        window.location.href = `/bundles/${selected.result.id}`;
        break;
      case 'user':
        window.location.href = `/account/user_profile/${selected.result.id}`;
        break;
      case 'filter':
        this.onInputChange(`${select.value} ${selected.result.key}`);
        break;
      default:
        return;
    }
  }

  render() {
    return <div>{JSON.stringify(this.state.bundles)}</div>;
    /*
    return (
      <SearchBarPresentation
        results={}
        isCategories
        isLoading={this.state.bundles[this.state.currentQuery].isFetching || this.state.worksheets[this.state.currentQuery].isFetching}
        inputText={this.state.currentQuery}
        onInputChange={onInputChange}
        onResultSelect={onResultSelect}
      />
    );
    */
  }
}

// TODO merge search_bar and search_bar_presentation
const ClSearch = styled(Search)`
  z-index:1000;
`;

// TODO do we need to click out of this element? Why all the custom code for it?
class SearchBarPresentationComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.setWrapperRef = this.setWrapperRef.bind(this);           
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
    this.props.bindShortcut('/', (e) => {
      document.getElementById("cl-search").focus();
      e.preventDefault();
    });
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
          id="cl-search"
          results={this.props.results}
          loading={this.props.isLoading}
          onSearchChange={onSearchChange}
          onResultSelect={onResultSelect}
          category={this.props.isCategories}
          value={this.props.inputText}
          open={stayOpen ? stayOpen : undefined}
          input={{fluid: true}}
          fluid={true}
        />
        <SearchBar />
      </div>
    );
  }
}

SearchBarPresentationComponent.propTypes = {
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
  inputText: PropTypes.string.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onResultSelect: PropTypes.func.isRequired,
};

let SearchBarPresentation = mouseTrap(SearchBarPresentationComponent);

export {
  SearchBarPresentation
};

// TODO write down Redux state for worksheet interface
// which element of worksheet is active?
// what actions?
// What are the props for each of the components
// Let's get rid of the jQuery
