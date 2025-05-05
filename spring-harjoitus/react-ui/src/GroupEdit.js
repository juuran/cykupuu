import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import AppNavbar from './AppNavbar';

const GroupEdit = () => {
  const initialFormState = {
    name: '',
    address: '',
    city: '',
    stateOrProvince: '',
    country: '',
    postalCode: ''
  };
  const [group, setGroup] = useState(initialFormState);
  const navigate = useNavigate();
  const { id } = useParams();

  // luokkatyylissä olisi 'componentDidMount' eli alustuksessa, mutta sen lisäksi käytetään 'componentDidUpdate'
  // tyylillä, jolloin tarkkaillaan id:tä ja setGroupia
  useEffect(() => {
    if (id !== 'new') {
      fetch(`/api/group/${id}`)
        .then(response => response.json())
        .then(data => setGroup(data));
    }
  }, [id, setGroup]);

  // ryhmän jonkin kentän päivittävä funktio, joka hyödyntää "spread" syntaksia (funktiota määritellessä
  // samannäköinen syntaksi olisi päinvastoin toimiva "rest parameter"), joka levittää taulukon osikseen
  const handleChange = (event) => {
    const { name, value } = event.target

    setGroup({ ...group, [name]: value })
  }

  // asynkroninen lomakkeen lähetys, jossa joko lisätään uusi ryhmä 'api/group/idSeJaSe' tai postataan
  // tyhjä 'api/group' (mitä tekee?), sen jälkeen valittu ryhmä tyhjätään (tarkistettu debuggerista,
  // että initialFormState todellakin tyhjä)  --  testaa mitä käy jos ei navigoidakaan!!!
  const handleSubmit = async (event) => {
    event.preventDefault();

    await fetch(`/api/group${group.id ? `/${group.id}` : ''}`, {
      method: (group.id) ? 'PUT' : 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(group)
    });
    setGroup(initialFormState);
    navigate('/groups');
  }

  const title = <h2>{group.id ? 'Edit Group' : 'Add Group'}</h2>;

  // piirtää ryhmän muokkausnäkymän, jossa submit (Save) kutsuu handleSubmitia
  return (<div>
      <AppNavbar/>
      <Container>
        {title}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="name">Name</Label>
            <Input type="text" name="name" id="name" value={group.name || ''}
                   onChange={handleChange} autoComplete="name"/>
          </FormGroup>
          <FormGroup>
            <Label for="address">Address</Label>
            <Input type="text" name="address" id="address" value={group.address || ''}
                   onChange={handleChange} autoComplete="address-level1"/>
          </FormGroup>
          <FormGroup>
            <Label for="city">City</Label>
            <Input type="text" name="city" id="city" value={group.city || ''}
                   onChange={handleChange} autoComplete="address-level1"/>
          </FormGroup>
          <div className="row">
            <FormGroup className="col-md-4 mb-3">
              <Label for="stateOrProvince">State/Province</Label>
              <Input type="text" name="stateOrProvince" id="stateOrProvince" value={group.stateOrProvince || ''}
                     onChange={handleChange} autoComplete="address-level1"/>
            </FormGroup>
            <FormGroup className="col-md-5 mb-3">
              <Label for="country">Country</Label>
              <Input type="text" name="country" id="country" value={group.country || ''}
                     onChange={handleChange} autoComplete="address-level1"/>
            </FormGroup>
            <FormGroup className="col-md-3 mb-3">
              <Label for="country">Postal Code</Label>
              <Input type="text" name="postalCode" id="postalCode" value={group.postalCode || ''}
                     onChange={handleChange} autoComplete="address-level1"/>
            </FormGroup>
          </div>
          <FormGroup>
            <Button color="primary" type="submit">Save</Button>{' '}
            <Button color="secondary" tag={Link} to="/groups">Cancel</Button>
          </FormGroup>
        </Form>
      </Container>
    </div>
  )
};

export default GroupEdit;
