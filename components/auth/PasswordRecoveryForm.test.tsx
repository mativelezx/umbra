import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
const auth=vi.hoisted(()=>({getUser:vi.fn(),resetPasswordForEmail:vi.fn(),updateUser:vi.fn()}));
vi.mock('@/lib/supabase/client',()=>({createClient:()=>({auth})}));
vi.mock('@/components/layout/AccessPrelude',()=>({AccessPrelude:()=>null}));
vi.mock('@/components/layout/Brand',()=>({Brand:()=> <span>umbra</span>}));
import { PasswordRecoveryForm } from './PasswordRecoveryForm';
beforeEach(()=>{vi.clearAllMocks();auth.getUser.mockResolvedValue({data:{user:{id:'synthetic'}}});auth.resetPasswordForEmail.mockResolvedValue({error:null});auth.updateUser.mockResolvedValue({error:null});});
it('requests a recovery link and does not reveal whether the account exists',async()=>{
  render(<PasswordRecoveryForm mode="request"/>);
  fireEvent.change(screen.getByLabelText('Email'),{target:{value:'qa@example.com'}});
  fireEvent.click(screen.getByRole('button',{name:'Mandarme el enlace'}));
  expect(await screen.findByRole('status')).toHaveTextContent('Si existe una cuenta');
  expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('qa@example.com',{redirectTo:expect.stringContaining('/auth/callback?next=/reset-password')});
});
it('explains an unavailable recovery provider without claiming a send',async()=>{
  auth.resetPasswordForEmail.mockRejectedValue(new Error('offline'));render(<PasswordRecoveryForm mode="request"/>);
  fireEvent.change(screen.getByLabelText('Email'),{target:{value:'qa@example.com'}});fireEvent.click(screen.getByRole('button',{name:'Mandarme el enlace'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Revisá tu conexión');expect(screen.queryByRole('status')).toBeNull();
});
it('blocks reset without a valid session and offers a new link',async()=>{
  auth.getUser.mockResolvedValue({data:{user:null}});render(<PasswordRecoveryForm mode="reset"/>);
  expect(await screen.findByRole('alert')).toHaveTextContent('El enlace no está activo');
  expect(screen.getByRole('button',{name:'Guardar nueva contraseña'})).toBeDisabled();expect(auth.updateUser).not.toHaveBeenCalled();
});
it('rejects mismatching passwords without updating the account',async()=>{
  render(<PasswordRecoveryForm mode="reset"/>);await waitFor(()=>expect(screen.getByRole('button',{name:'Guardar nueva contraseña'})).toBeEnabled());
  fireEvent.change(screen.getByLabelText('Nueva contraseña'),{target:{value:'SyntheticPass123!'}});fireEvent.change(screen.getByLabelText('Repetir nueva contraseña'),{target:{value:'DifferentPass123!'}});
  fireEvent.click(screen.getByRole('button',{name:'Guardar nueva contraseña'}));expect(await screen.findByRole('alert')).toHaveTextContent('no coinciden');expect(auth.updateUser).not.toHaveBeenCalled();
});
it('updates a matching password and clears the inputs after success',async()=>{
  render(<PasswordRecoveryForm mode="reset"/>);await waitFor(()=>expect(screen.getByRole('button',{name:'Guardar nueva contraseña'})).toBeEnabled());
  for(const label of ['Nueva contraseña','Repetir nueva contraseña'])fireEvent.change(screen.getByLabelText(label),{target:{value:'SyntheticPass123!'}});
  fireEvent.click(screen.getByRole('button',{name:'Guardar nueva contraseña'}));expect(await screen.findByRole('status')).toHaveTextContent('quedó actualizada');expect(auth.updateUser).toHaveBeenCalledWith({password:'SyntheticPass123!'});expect(screen.queryByLabelText('Nueva contraseña')).toBeNull();
});
