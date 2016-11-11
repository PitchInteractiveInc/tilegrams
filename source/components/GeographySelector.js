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
        value={geographyIndex}
      >
        {geography.label}
      </option>
    )
  })
  return (
    <div className='geographySelector'>
      <select value={props.selectedGeography} onChange={selectGeography}>
        {options}
      </select>
    </div>
  )
}
GeographySelector.propTypes = {
  selectedGeography: React.PropTypes.number,
  selectGeography: React.PropTypes.func,
}
