import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import styled from 'styled-components';

class SearchBarPresentation extends React.Component {
  render() {
    const onValueSelected = (selected) => {
      window.location.href = `/worksheets/${selected.value}`
    };

    const onInputChange = (inputValue) => {
      console.log(inputValue);
      this.props.onInputChange(inputValue);
      return inputValue;
    };

    // TODO this isn working...
    // from: https://github.com/JedWatson/react-select/issues/1679
    const ClSearchSelect = styled(Select)`
      &.Select {
        .Select-control {
          display: inline;
          width: 50%;
        }
      }
    `;
    return (
      <Select
        name="Search"
        options={this.props.options}
        onChange={onValueSelected}
        onInputChange={onInputChange}
        onBlurResetsInput={false}
        isLoading={this.props.isLoading}
      />
    );
  }
}

SearchBarPresentation.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string
    })
  ),
  onInputChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export {
  SearchBarPresentation
};
