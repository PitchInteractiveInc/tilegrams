import React from 'react'

import GeographyResource from '../resources/GeographyResource'

export default function GeographySelector(props) {
  const selectGeography = (event) => {
    props.selectGeography(event.target.value)
  }
  const options = GeographyResource.getGeographies().map((geography, geographyIndex) => {
    return (
      <option
        key={geographyIndex}
        value={geography.label}
      >
        {geography.label}
      </option>
    )
  })
  return (
    <div className='geographySelector'>
      Select base map
      <fieldset>
        <select onChange={selectGeography}>
          {options}
        </select>
      </fieldset>
    </div>
  )
}
GeographySelector.propTypes = {
  selectedGeography: React.PropTypes.string,
  selectGeography: React.PropTypes.func,
}
