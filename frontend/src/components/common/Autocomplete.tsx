import checkBoxOutline from '@iconify/icons-mdi/check-box-outline';
import checkboxBlankOutline from '@iconify/icons-mdi/checkbox-blank-outline';
import { Icon } from '@iconify/react';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import { useTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { addQuery, getFilterValueByNameFromURL } from '../../helpers';
import Namespace from '../../lib/k8s/namespace';
import { setNamespaceFilter } from '../../redux/actions/actions';
import { useTypedSelector } from '../../redux/reducers/reducers';

// @todo: This is using Autcomplete from Material-UI's lab, but we should instead replace it
// by a fully custom solution, as getting the input to behave the way we intended proved difficult
// and not worth of pulling the extra dependencies.
export function NamespacesAutocomplete() {
  const theme = useTheme();
  const filter = useTypedSelector(state => state.filter);
  const [namespaces, setNamespaces] = React.useState<Namespace[]>([]);
  const queryParamDefaultObj = {'namespace': ''};
  const location = useLocation();
  const history = useHistory();

  Namespace.useApiList(setNamespaces);

  const dispatch = useDispatch();

  function renderTags(tags: string[]) {
    let jointTags = tags.join(', ');
    if (jointTags.length > 15) {
      jointTags = jointTags.slice(0, 15) + '…';
    }

    return (
      <Typography>{jointTags}</Typography>
    );
  }

  React.useEffect(() => {
    const selectedNamespace = getFilterValueByNameFromURL('namespace', location, true);
    if (!selectedNamespace) {
      return;
    }
    dispatch(setNamespaceFilter(selectedNamespace));
  },
  // eslint-disable-next-line
  []);

  return (
    <Autocomplete
      multiple
      id="namespaces-filter"
      autoComplete
      options={namespaces.map(namespace => namespace.metadata.name)}
      onChange={(event, newValue) => {
        addQuery({'namespace': newValue.join(',')}, queryParamDefaultObj,
        history, location, '', true);
        dispatch(setNamespaceFilter(newValue));
        return [newValue];
      }}
      // We reverse the namespaces so the last chosen appear as the first in the label. This
      // is useful since the label is ellipsized and this we get to see it change.
      value={[...filter.namespaces.values()].reverse()}
      renderOption={(option, { selected }) => (
        <React.Fragment>
          <Checkbox
            icon={<Icon icon={checkboxBlankOutline} />}
            checkedIcon={<Icon icon={checkBoxOutline} />}
            style={{
              color: selected ? theme.palette.primary.main : theme.palette.text.primary }}
            checked={selected}
          />
          {option}
        </React.Fragment>
      )}
      renderTags={renderTags}
      renderInput={params => (
        <Box width="15rem">
          <TextField
            {...params}
            variant="standard"
            label="Namespaces"
            fullWidth
            InputLabelProps={{shrink: true}}
            style={{marginTop: 0}}
            placeholder={[...filter.namespaces.values()].length > 0 ? '' : 'Filter'}
          />
        </Box>
      )}
    />
  );
}
