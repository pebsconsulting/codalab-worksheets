import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Search } from 'semantic-ui-react';

const ClSearch = styled(Search)`
  z-index:1000;
`;

class SearchBarPresentation extends React.Component {
  render() {
    const onResultSelect = (e, selected) => {
      if (selected.result.type === 'worksheet') {
      window.location.href = 
        `/worksheets/${selected.result.id}`;
      } else if (selected.result.type === 'bundle') {
      window.location.href = 
        `/bundles/${selected.result.id}`;
      }
    };

    const onSearchChange = (e, { value }) => {
      this.props.onInputChange(value);
    };

    return (
      <ClSearch
        results={this.props.results}
        loading={this.props.isLoading}
        onSearchChange={onSearchChange}
        onResultSelect={onResultSelect}
        category={true}
      />
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
  onInputChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export {
  SearchBarPresentation
};
